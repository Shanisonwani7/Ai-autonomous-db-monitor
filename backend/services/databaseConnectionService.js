const crypto = require("crypto");
const { Client } = require("pg");
const prisma = require("../config/prisma");

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
  const [ivHex, authTagHex, dataHex] = (encryptedText || "").split(":");
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

// -------------------- Health Score --------------------
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

const CONNECT_TIMEOUT_MS = 5000;

function isUnsupportedDbType(dbType) {
  if (!dbType) return false;
  const normalized = dbType.toLowerCase();
  return normalized !== "postgresql" && normalized !== "postgres";
}

/**
 * Single source of truth for "test this database's live connection and
 * persist the result". Used by addDatabase, updateDatabase, and
 * testConnection in databaseController.js — no other module should
 * open its own pg.Client for this purpose.
 *
 * @param {object} database - a Prisma database row (must include id, host,
 *   port, username, password (encrypted), name, dbType).
 * @returns {Promise<{
 *   success: boolean,
 *   database?: object,        // fresh Prisma row after status update (when persisted)
 *   metrics?: object,         // status/databaseVersion/databaseSize/activeConnections/uptime/healthScore
 *   skipped?: boolean,        // true when dbType isn't supported yet (status left untouched)
 *   errorCode?: "UNSUPPORTED_DB_TYPE" | "DECRYPT_FAILED" | "CONNECTION_FAILED",
 *   errorMessage?: string
 * }>}
 */
async function refreshConnectionStatus(database) {
  if (isUnsupportedDbType(database.dbType)) {
    return {
      success: false,
      skipped: true,
      errorCode: "UNSUPPORTED_DB_TYPE",
      errorMessage: `Connection testing for '${database.dbType}' is not supported yet`,
    };
  }

  let plainPassword;
  try {
    plainPassword = decryptPassword(database.password);
  } catch (decryptErr) {
    console.error("Password decryption failed:", decryptErr.message);
    return {
      success: false,
      errorCode: "DECRYPT_FAILED",
      errorMessage:
        "Could not decrypt stored credentials. Please re-save the database password.",
    };
  }

  let client;

  try {
    client = new Client({
  host: database.host,
  port: database.port,
  user: database.username,
  password: plainPassword,
  database: database.name,
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

    const activeConnections = Number(
      connectionResult.rows[0]?.connections ?? 0
    );
    const dbSize = sizeResult.rows[0]?.size ?? null;
    const uptime = uptimeResult.rows[0]?.uptime ?? null;
    const dbVersion = versionResult.rows[0]?.version ?? null;

    const healthScore = calculateHealthScore({
      activeConnections,
      dbSize,
      uptime,
    });

    const lastCheck = new Date();

    const updated = await prisma.database.update({
      where: { id: database.id },
      data: {
        status: "Connected",
        databaseSize: dbSize,
        activeConnections,
        uptime: uptime ? uptime.toString() : null,
        databaseVersion: dbVersion,
        healthScore,
        lastCheck,
      },
    });

    return {
      success: true,
      database: updated,
      metrics: {
        status: "Connected",
        databaseVersion: dbVersion,
        databaseSize: dbSize,
        activeConnections,
        uptime,
        healthScore,
      },
    };
  } catch (err) {
    console.log("========== DATABASE CONNECTION ERROR ==========");
    console.log(err);

    console.log("Host:", database.host);
    console.log("Port:", database.port);
    console.log("Username:", database.username);
    console.log("Database:", database.name);

    console.log("Error:", err.message);

    let updated;
    try {
      updated = await prisma.database.update({
        where: { id: database.id },
        data: {
          status: "Disconnected",
          lastCheck: new Date(),
        },
      });
    } catch (updateError) {
      console.error("Failed to update database status:", updateError.message);
    }

    return {
      success: false,
      errorCode: "CONNECTION_FAILED",
      errorMessage: err.message,
      database: updated,
    };
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
}

module.exports = {
  encryptPassword,
  decryptPassword,
  calculateHealthScore,
  refreshConnectionStatus,
};