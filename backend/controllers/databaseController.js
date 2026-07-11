const prisma = require("../config/prisma");
const {
  encryptPassword,
  refreshConnectionStatus,
} = require("../services/monitoringService");

const HOST_PATTERN =
  /^(localhost|(\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;

const NAME_MAX_LENGTH = 100;
const HOST_MAX_LENGTH = 255;
const USERNAME_MAX_LENGTH = 100;

function validateDatabaseInput({ name, dbType, host, port, username, databaseName }) {
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Database name is required");
  } else if (name.trim().length > NAME_MAX_LENGTH) {
    errors.push(`Database name must be under ${NAME_MAX_LENGTH} characters`);
  }

  // databaseName is optional (falls back to name), but when provided it's
  // validated exactly like name.
  if (databaseName !== undefined && databaseName !== null && databaseName !== "") {
    if (typeof databaseName !== "string" || !databaseName.trim()) {
      errors.push("databaseName must be a non-empty string");
    } else if (databaseName.trim().length > NAME_MAX_LENGTH) {
      errors.push(`databaseName must be under ${NAME_MAX_LENGTH} characters`);
    }
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

exports.addDatabase = async (req, res) => {
  try {
    const { name, dbType, host, port, username, password, databaseName } = req.body;

    const { errors, portNum } = validateDatabaseInput({
      name,
      dbType,
      host,
      port,
      username,
      databaseName,
    });
    if (!password) errors.push("Password is required");
    if (errors.length) {
      return res.status(400).json({ message: "Validation Failed", errors });
    }

    const database = await prisma.database.create({
      data: {
        name: name.trim(),
        databaseName: databaseName?.trim() || name.trim(),
        dbType,
        host,
        port: portNum,
        username,
        password: encryptPassword(password),
        userId: req.user.id,
      },
    });

    // Same shared refresh used by Update and manual Test Connection.
    const refreshResult = await refreshConnectionStatus(database);
    const finalDatabase = refreshResult.database || database;

    const { password: _pw, ...safeDatabase } = finalDatabase;

    res.status(201).json({
      message: "Database Added Successfully",
      database: safeDatabase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getDatabases = async (req, res) => {
  try {
    const databases = await prisma.database.findMany({
      where: { userId: req.user.id },
    });

    const safeDatabases = databases.map(({ password, ...rest }) => rest);
    res.json(safeDatabases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.updateDatabase = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid database id" });
    }

    const { name, dbType, host, port, username, password, databaseName } = req.body;

    const existing = await prisma.database.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Database Not Found or Access Denied" });
    }

    const { errors, portNum } = validateDatabaseInput({
      name,
      dbType,
      host,
      port,
      username,
      databaseName,
    });
    if (errors.length) {
      return res.status(400).json({ message: "Validation Failed", errors });
    }

    const database = await prisma.database.update({
      where: { id },
      data: {
        name: name.trim(),
        databaseName: databaseName?.trim() || name.trim(),
        dbType,
        host,
        port: portNum,
        username,
        ...(password ? { password: encryptPassword(password) } : {}),
      },
    });

    const refreshResult = await refreshConnectionStatus(database);
    const finalDatabase = refreshResult.database || database;

    const { password: _pw, ...safeDatabase } = finalDatabase;

    res.json({
      message: "Database Updated Successfully",
      database: safeDatabase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.deleteDatabase = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid database id" });
    }

    const existing = await prisma.database.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Database Not Found or Access Denied" });
    }

    await prisma.database.delete({ where: { id } });

    res.json({ message: "Database Deleted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.testConnection = async (req, res) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid database id" });
  }

  try {
    const database = await prisma.database.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!database) {
      return res.status(404).json({ message: "Database Not Found or Access Denied" });
    }

    const result = await refreshConnectionStatus(database);

    if (!result.success) {
      if (result.errorCode === "UNSUPPORTED_DB_TYPE") {
        return res.status(400).json({ message: result.errorMessage });
      }
      if (result.errorCode === "DECRYPT_FAILED") {
        return res.status(500).json({ message: result.errorMessage });
      }
      // status already persisted as "Disconnected" inside refreshConnectionStatus()
      return res.status(500).json({
        message: "Database Connection Failed",
        error: result.errorMessage,
      });
    }

    const { metrics } = result;

    res.json({
      message: "Database Connected Successfully",
      status: metrics.status,
      databaseVersion: metrics.databaseVersion,
      databaseSize: metrics.databaseSize,
      activeConnections: metrics.activeConnections,
      uptime: metrics.uptime,
      healthScore: metrics.healthScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};