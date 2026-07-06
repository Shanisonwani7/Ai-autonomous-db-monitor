const prisma = require("../config/prisma");
const { Client } = require("pg");
const crypto = require("crypto");

// Kitne time tak connection attempt karke hang na ho (ms)
const CONNECT_TIMEOUT_MS = 5000;

// -------------------- Password Encryption (AES-256-GCM) --------------------
// ENCRYPTION_KEY .env me 64-character hex string honi chahiye (32 bytes).
// Generate karne ke liye: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const ALGORITHM = "aes-256-gcm";
const RAW_KEY = process.env.DB_CREDENTIALS_ENCRYPTION_KEY;

if (!RAW_KEY || RAW_KEY.length !== 64) {
  console.error(
    "FATAL: DB_CREDENTIALS_ENCRYPTION_KEY missing or invalid (must be 64 hex chars / 32 bytes). " +
      "Password encryption will not work correctly."
  );
}

const ENCRYPTION_KEY = RAW_KEY ? Buffer.from(RAW_KEY, "hex") : null;
if (!ENCRYPTION_KEY) {
  throw new Error(
    "DB_CREDENTIALS_ENCRYPTION_KEY is missing. Please configure it in .env"
  );
}

function encryptPassword(plainText) {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not configured");
  }
  const iv = crypto.randomBytes(12); // GCM ke liye 12 bytes recommended
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext (sab hex me), DB me ek hi string store hoti hai
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString(
    "hex"
  )}`;
}

function decryptPassword(encryptedText) {
  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not configured");
  }
  const [ivHex, authTagHex, dataHex] = encryptedText.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Invalid encrypted password format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// -------------------- Helper: Input Validation --------------------
// Simple hostname/IPv4 pattern — bahut strict nahi, bas garbage input rokne ke liye
const HOST_PATTERN =
  /^(localhost|(\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;

const NAME_MAX_LENGTH = 100;
const HOST_MAX_LENGTH = 255;
const USERNAME_MAX_LENGTH = 100;

function validateDatabaseInput({ name, dbType, host, port, username }) {
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Database name is required");
  } else if (name.trim().length > NAME_MAX_LENGTH) {
    errors.push(`Database name must be under ${NAME_MAX_LENGTH} characters`);
  }

  if (!dbType || typeof dbType !== "string") {
    errors.push("dbType is required");
  }

  if (!host || typeof host !== "string") {
    errors.push("Host is required");
  } else if (host.trim().length > HOST_MAX_LENGTH) {
    errors.push(`Host must be under ${HOST_MAX_LENGTH} characters`);
  } else if (!HOST_PATTERN.test(host.trim())) {
    errors.push("Host must be a valid hostname or IP address");
  }

  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  } else if (username.trim().length > USERNAME_MAX_LENGTH) {
    errors.push(`Username must be under ${USERNAME_MAX_LENGTH} characters`);
  }

  const portNum = Number(port);
  if (!port || Number.isNaN(portNum) || portNum <= 0 || portNum > 65535) {
    errors.push("Valid port (1-65535) is required");
  }

  return { errors, portNum };
}

// -------------------- Helper: Health Score --------------------
// Modular scoring: aaj sirf connections/size/uptime available hain,
// lekin future metrics (cpu, ram, disk, slowQueries, locks, replicationLag)
// aane par yahin weight add kar dena — baaki logic wahi rahega.
const HEALTH_WEIGHTS = {
  highConnections: 20,
  missingSize: 20,
  missingUptime: 20,
  // Future metrics — jab data available ho tab enable karo:
  cpuUsage: 15,
  ramUsage: 15,
  diskUsage: 15,
  slowQueries: 10,
  locks: 10,
  replicationLag: 10,
};

const CONNECTION_THRESHOLD = 50;

function calculateHealthScore(metrics) {
  const {
    activeConnections,
    dbSize,
    uptime,
    // Future-ready fields — abhi undefined aayenge to skip ho jaayenge
    cpuUsage,
    ramUsage,
    diskUsage,
    slowQueries,
    hasLocks,
    replicationLagSeconds,
  } = metrics;

  let score = 100;

  if (activeConnections > CONNECTION_THRESHOLD) {
    score -= HEALTH_WEIGHTS.highConnections;
  }
  if (!dbSize) {
    score -= HEALTH_WEIGHTS.missingSize;
  }
  if (!uptime) {
    score -= HEALTH_WEIGHTS.missingUptime;
  }

  // Ye checks tab activate hongi jab respective metrics collect karna start karenge
  if (typeof cpuUsage === "number" && cpuUsage > 80) {
    score -= HEALTH_WEIGHTS.cpuUsage;
  }
  if (typeof ramUsage === "number" && ramUsage > 85) {
    score -= HEALTH_WEIGHTS.ramUsage;
  }
  if (typeof diskUsage === "number" && diskUsage > 90) {
    score -= HEALTH_WEIGHTS.diskUsage;
  }
  if (typeof slowQueries === "number" && slowQueries > 0) {
    score -= HEALTH_WEIGHTS.slowQueries;
  }
  if (hasLocks) {
    score -= HEALTH_WEIGHTS.locks;
  }
  if (typeof replicationLagSeconds === "number" && replicationLagSeconds > 30) {
    score -= HEALTH_WEIGHTS.replicationLag;
  }

  return Math.max(score, 0);
}

// -------------------- Add Database --------------------
exports.addDatabase = async (req, res) => {
  try {
    const { name, dbType, host, port, username, password } = req.body;

    const { errors, portNum } = validateDatabaseInput({
      name,
      dbType,
      host,
      port,
      username,
    });

    if (!password) {
      errors.push("Password is required");
    }

    if (errors.length) {
      return res.status(400).json({ message: "Validation Failed", errors });
    }

    const database = await prisma.database.create({
      data: {
        name: name.trim(),
        dbType,
        host,
        port: portNum,
        username,
        password: encryptPassword(password), // Ab plaintext store nahi hota
        userId: req.user.id,
      },
    });

    // Password kabhi bhi response me wapas mat bhejo
    const { password: _pw, ...safeDatabase } = database;

    res.status(201).json({
      message: "Database Added Successfully",
      database: safeDatabase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// -------------------- Get All Databases --------------------
exports.getDatabases = async (req, res) => {
  try {
    const databases = await prisma.database.findMany({
      where: {
        userId: req.user.id,
      },
    });

    // Password field kabhi client ko expose mat karo
    const safeDatabases = databases.map(({ password, ...rest }) => rest);

    res.json(safeDatabases);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// -------------------- Update Database --------------------
exports.updateDatabase = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid database id" });
    }

    const { name, dbType, host, port, username, password } = req.body;

    // Pehle check karo ye record isi user ka hai ya nahi (IDOR fix)
    const existing = await prisma.database.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Database Not Found or Access Denied",
      });
    }

    const { errors, portNum } = validateDatabaseInput({
      name,
      dbType,
      host,
      port,
      username,
    });

    if (errors.length) {
      return res.status(400).json({ message: "Validation Failed", errors });
    }

    const database = await prisma.database.update({
      where: { id },
      data: {
        name: name.trim(),
        dbType,
        host,
        port: portNum,
        username,
        // Agar password field khaali bheja gaya to purana (encrypted) password hi rakho
        ...(password ? { password: encryptPassword(password) } : {}),
      },
    });

    const { password: _pw, ...safeDatabase } = database;

    res.json({
      message: "Database Updated Successfully",
      database: safeDatabase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// -------------------- Delete Database --------------------
exports.deleteDatabase = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid database id" });
    }

    // Ownership check (IDOR fix)
    const existing = await prisma.database.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Database Not Found or Access Denied",
      });
    }

    await prisma.database.delete({
      where: { id },
    });

    res.json({
      message: "Database Deleted Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// -------------------- Test PostgreSQL Connection --------------------
exports.testConnection = async (req, res) => {
  const id = Number(req.params.id);
  let client;

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid database id" });
  }

  try {
    // Ownership check (IDOR fix)
    const database = await prisma.database.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!database) {
      return res.status(404).json({
        message: "Database Not Found or Access Denied",
      });
    }

    // Abhi ke liye sirf postgres supported hai — dbType check karo
    if (database.dbType && database.dbType.toLowerCase() !== "postgresql" && database.dbType.toLowerCase() !== "postgres") {
      return res.status(400).json({
        message: `Connection testing for '${database.dbType}' is not supported yet`,
      });
    }

    let plainPassword;
    try {
      plainPassword = decryptPassword(database.password);
    } catch (decryptErr) {
      console.error("Password decryption failed:", decryptErr.message);
      return res.status(500).json({
        message: "Could not decrypt stored credentials. Please re-save the database password.",
      });
    }

    client = new Client({
      host: database.host,
      port: database.port,
      user: database.username,
      password: plainPassword,
      database: "postgres",
      connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    });

    await client.connect();

    // PostgreSQL Version
    const versionResult = await client.query("SELECT version();");

    // Database Size (target database ka naam, "postgres" nahi)
    const sizeResult = await client.query(
      `SELECT pg_size_pretty(pg_database_size($1)) AS size;`,
      [database.name]
    );

    // Active Connections
    const connectionResult = await client.query(
      `SELECT count(*) AS connections
       FROM pg_stat_activity
       WHERE datname = $1;`,
      [database.name]
    );

    // Uptime
    const uptimeResult = await client.query(
      "SELECT now() - pg_postmaster_start_time() AS uptime;"
    );

    const activeConnections = Number(connectionResult.rows[0]?.connections ?? 0);
    const dbSize = sizeResult.rows[0]?.size ?? null;
    const uptime = uptimeResult.rows[0]?.uptime ?? null;
    const dbVersion = versionResult.rows[0]?.version ?? null;

    // NOTE: cpuUsage, ramUsage, diskUsage, slowQueries, hasLocks, replicationLagSeconds
    // future me yahin metrics collect karke pass karna — function already ready hai.
    const healthScore = calculateHealthScore({
      activeConnections,
      dbSize,
      uptime,
    });

    await prisma.database.update({
      where: { id },
      data: {
        status: "Connected",
        databaseSize: dbSize,
        activeConnections,
        uptime: uptime ? uptime.toString() : null,
        databaseVersion: dbVersion,
        healthScore,
        lastCheck: new Date(),
      },
    });

    res.json({
      message: "Database Connected Successfully",
      status: "Connected",
      databaseVersion: dbVersion,
      databaseSize: dbSize,
      activeConnections,
      uptime,
      healthScore,
    });
  } catch (err) {
    console.error(err);

    try {
      await prisma.database.update({
        where: { id },
        data: {
          status: "Disconnected",
          lastCheck: new Date(),
        },
      });
    } catch (updateError) {
      console.error("Failed to update database status:", updateError.message);
    }

    res.status(500).json({
      message: "Database Connection Failed",
      error: err.message,
    });
  } finally {
    // Connection leak fix: chahe error aaye ya na aaye, client hamesha close ho
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error("Failed to close client:", closeErr.message);
      }
    }
  }
};