const prisma = require("../config/prisma");
const { Client } = require("pg");

// =======================
// Add Database
// =======================
exports.addDatabase = async (req, res) => {
  try {
    const { name, dbType, host, port, username, password } = req.body;

    const database = await prisma.database.create({
      data: {
        name,
        dbType,
        host,
        port: Number(port),
        username,
        password,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Database Added Successfully",
      database,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// =======================
// Get All Databases
// =======================
exports.getDatabases = async (req, res) => {
  try {
    const databases = await prisma.database.findMany({
      where: {
        userId: req.user.id,
      },
    });

    res.json(databases);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// =======================
// Update Database
// =======================

   exports.updateDatabase = async (req, res) => {
  console.log("=========== UPDATE API ===========");
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("==================================");

  try {
    const id = Number(req.params.id);

    if (!req.body) {
      return res.status(400).json({
        message: "Body is missing"
      });
    }

    const { name, dbType, host, port, username, password } = req.body;

    const database = await prisma.database.update({
      where: {
        id,
      },
      data: {
        name,
        dbType,
        host,
        port: Number(port),
        username,
        password,
      },
    });

    res.json({
      message: "Database Updated Successfully",
      database,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// =======================
// Delete Database
// =======================
exports.deleteDatabase = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.database.delete({
      where: {
        id,
      },
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

// =======================
// Test PostgreSQL Connection
// =======================
exports.testConnection = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      return res.status(404).json({
        message: "Database Not Found",
      });
    }

    const client = new Client({
      host: database.host,
      port: database.port,
      user: database.username,
      password: database.password,
      database: "postgres", // Default PostgreSQL database
    });

    await client.connect();

    // Database Size
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size('${database.name}')) AS size;
    `);

    // Active Connections
    const connectionResult = await client.query(`
      SELECT count(*) AS connections
      FROM pg_stat_activity
      WHERE datname='${database.name}';
    `);

    // PostgreSQL Uptime
    const uptimeResult = await client.query(`
      SELECT now() - pg_postmaster_start_time() AS uptime;
    `);

    await client.end();

    await prisma.database.update({
      where: { id },
      data: {
        status: "Connected",
        databaseSize: sizeResult.rows[0].size,
        activeConnections: Number(connectionResult.rows[0].connections),
        uptime: uptimeResult.rows[0].uptime.toString(),
        lastCheck: new Date(),
      },
    });

    res.json({
      message: "Database Connected Successfully",
      status: "Connected",
      databaseSize: sizeResult.rows[0].size,
      activeConnections: connectionResult.rows[0].connections,
      uptime: uptimeResult.rows[0].uptime,
    });

  } catch (err) {
    console.error(err);

    await prisma.database.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: "Disconnected",
        lastCheck: new Date(),
      },
    });

    res.status(500).json({
      message: "Database Connection Failed",
      error: err.message,
    });
  }
};