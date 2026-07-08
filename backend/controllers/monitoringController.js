const crypto = require("crypto");
const prisma = require("../config/prisma");
const { Client } = require("pg");
const { calculateHealthScore } = require("../utils/healthScore");
const { formatDuration } = require("../utils/formatDuration");

const ALGORITHM = "aes-256-gcm";
const RAW_KEY = process.env.DB_CREDENTIALS_ENCRYPTION_KEY;

// Fail fast at startup instead of crashing mid-request
if (!RAW_KEY || Buffer.from(RAW_KEY, "hex").length !== 32) {
  throw new Error(
    "DB_CREDENTIALS_ENCRYPTION_KEY is missing or is not a valid 32-byte hex string"
  );
}
const ENCRYPTION_KEY = Buffer.from(RAW_KEY, "hex");

// Timeouts (ms) - tune as needed
const CONNECT_TIMEOUT_MS = 5000;
const STATEMENT_TIMEOUT_MS = 5000;

// Max rows to return so a busy database can't blow up the response
const RUNNING_QUERIES_LIMIT = 100;

// ---------- Helpers ----------

// Decrypt Database Password (with validation)
function decryptPassword(encryptedPassword) {
  try {
    const parts = encryptedPassword.split(":");
    if (parts.length !== 3) {
      throw new Error("Malformed encrypted password format");
    }
    const [ivHex, authTagHex, encryptedHex] = parts;

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    // Don't leak crypto internals upward - normalize the error
    const wrapped = new Error("Failed to decrypt stored database credentials");
    wrapped.cause = err;
    throw wrapped;
  }
}

// Parse and validate the :id route param
function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// Fetch a database record scoped to the current user
async function getOwnedDatabase(id, userId) {
  return prisma.database.findFirst({
    where: { id, userId },
  });
}

// Build and connect a pg Client for a given database record
async function connectClient(database) {
  const password = decryptPassword(database.password);

  const client = new Client({
    host: database.host,
    port: database.port,
    user: database.username,
    password,
    database: "postgres",
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    statement_timeout: STATEMENT_TIMEOUT_MS,
    query_timeout: STATEMENT_TIMEOUT_MS,
    ssl: database.ssl ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();
  return client;
}

// Consistent, safe error response (logs full error server-side only)
function sendSafeError(res, err, publicMessage) {
  console.error(err);
  res.status(500).json({
    success: false,
    message: publicMessage,
  });
}

// Same as sendSafeError but also includes err.message in the response body
// (a few endpoints below were already returning this, so keeping it as a
// separate helper instead of changing their response shape)
function sendSafeErrorWithMessage(res, err, publicMessage) {
  console.error(err);
  res.status(500).json({
    success: false,
    message: publicMessage,
    error: err.message,
  });
}

// ---------- Controllers ----------

// Get PostgreSQL Version
exports.getDatabaseVersion = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query("SELECT version();");

    res.json({
      success: true,
      database: database.name,
      version: result.rows[0].version,
    });
  } catch (err) {
    sendSafeError(res, err, "Failed to retrieve database version");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Dashboard Metrics
exports.getDashboardMetrics = async (req, res) => {
  let client;
  const id = parseId(req.params.id);

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    // Get PostgreSQL Version
    const versionResult = await client.query("SELECT version();");

    // Get Database Size
    const sizeResult = await client.query(
      "SELECT pg_size_pretty(pg_database_size($1)) AS size;",
      [database.name]
    );

    // Get Active Connections
    const connectionResult = await client.query(
      "SELECT COUNT(*) AS total FROM pg_stat_activity WHERE datname = $1;",
      [database.name]
    );

    // Get Database Uptime
    const uptimeResult = await client.query(
      "SELECT now() - pg_postmaster_start_time() AS uptime;"
    );

    const version = versionResult.rows[0].version;
    const databaseSize = sizeResult.rows[0].size;
    const activeConnections = Number(connectionResult.rows[0].total);

    // Build a human-readable uptime string (Postgres only includes fields that are non-zero)
    const interval = uptimeResult.rows[0].uptime;
    const uptimeParts = [];
    if (interval.years) uptimeParts.push(`${interval.years} Years`);
    if (interval.months) uptimeParts.push(`${interval.months} Months`);
    uptimeParts.push(`${interval.days || 0} Days`);
    uptimeParts.push(`${interval.hours || 0} Hours`);
    uptimeParts.push(`${interval.minutes || 0} Minutes`);
    const uptime = uptimeParts.join(" ");

    // Calculate Health Score
    const healthScore = calculateHealthScore(
      activeConnections,
      databaseSize,
      uptime
    );
    const lastCheck = new Date();

    // Save Latest Metrics
    await prisma.database.update({
      where: { id },
      data: {
        status: "Connected",
        databaseVersion: version,
        databaseSize,
        activeConnections,
        uptime,
        healthScore,
        lastCheck,
      },
    });

    // Dashboard Response
    res.json({
      success: true,
      database: {
        id: database.id,
        name: database.name,
        type: database.dbType,
        host: database.host,
        port: database.port,
        status: "Connected",
        version,
        databaseSize,
        activeConnections,
        uptime,
        healthScore,
        lastCheck,
      },
    });
  } catch (err) {
    console.error(err);

    if (id) {
      try {
        await prisma.database.update({
          where: { id },
          data: {
            status: "Disconnected",
            lastCheck: new Date(),
          },
        });
      } catch (updateErr) {
        console.error("Failed to mark database as disconnected:", updateErr);
      }
    }

    res.status(500).json({
      success: false,
      message: "Database Monitoring Failed",
      error: err.message,
    });
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Running Queries
exports.getRunningQueries = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid,
        usename,
        datname,
        state,
        NOW() - query_start AS duration,
        LEFT(query, 150) AS query_preview,
        LENGTH(query) AS query_length
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'active'
        AND pid != pg_backend_pid()
      ORDER BY query_start ASC
      LIMIT $2;
      `,
      [database.name, RUNNING_QUERIES_LIMIT]
    );

    const queries = result.rows.map((row) => {
      const { duration, query_preview, query_length, ...rest } = row;

      return {
        ...rest,
        duration: formatDuration(duration),
        queryPreview: query_preview,
        queryLength: Number(query_length),
      };
    });

    res.json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (err) {
    sendSafeError(res, err, "Failed to fetch running queries");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Database Locks
exports.getDatabaseLocks = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        l.pid,
        a.usename,
        a.datname,
        l.locktype,
        l.mode,
        l.granted,
        a.state,
        LEFT(a.query, 300) AS query
      FROM pg_locks l
      JOIN pg_stat_activity a
        ON l.pid = a.pid
      WHERE a.datname = $1
      ORDER BY l.granted DESC;
      `,
      [database.name]
    );

    res.json({
      success: true,
      count: result.rows.length,
      locks: result.rows,
    });
  } catch (err) {
    sendSafeErrorWithMessage(res, err, "Failed to fetch database locks");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Slow Queries
exports.getSlowQueries = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid,
        usename,
        datname,
        state,
        NOW() - query_start AS duration,
        LEFT(query, 150) AS query_preview,
        LENGTH(query) AS query_length
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'active'
        AND NOW() - query_start > INTERVAL '5 seconds'
        AND pid != pg_backend_pid()
      ORDER BY query_start ASC;
      `,
      [database.name]
    );

    const slowQueries = result.rows.map((row) => {
      const {
        duration,
        query_preview,
        query_length,
        ...rest
      } = row;

      return {
        ...rest,
        duration: formatDuration(duration),
        queryPreview: query_preview,
        queryLength: Number(query_length),
     };
    });
    res.json({
      success: true,
      count: slowQueries.length,
      slowQueries,
    });
  } catch (err) {
    sendSafeErrorWithMessage(res, err, "Failed to fetch slow queries");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Long Running Transactions
exports.getLongRunningTransactions = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid,
        usename,
        datname,
        state,
        xact_start,
        NOW() - xact_start AS transaction_duration,
        LEFT(query, 150) AS query_preview,
        LENGTH(query) AS query_length
      FROM pg_stat_activity
      WHERE datname = $1
        AND xact_start IS NOT NULL
        AND NOW() - xact_start > INTERVAL '30 seconds'
        AND pid != pg_backend_pid()
      ORDER BY xact_start ASC;
      `,
      [database.name]
    );

    const transactions = result.rows.map((row) => {
      const {
        transaction_duration,
        query_preview,
        query_length,
        ...rest
      } = row;

      return {
        ...rest,
        transactionDuration: formatDuration(transaction_duration),
        queryPreview: query_preview,
        queryLength: Number(query_length),
      };
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    sendSafeErrorWithMessage(res, err, "Failed to fetch long running transactions");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Idle Sessions
exports.getIdleSessions = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid,
        usename,
        datname,
        application_name,
        client_addr,
        state,
        state_change,
        NOW() - state_change AS idle_duration,
        LEFT(query, 150) AS query_preview,
        LENGTH(query) AS query_length
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'idle'
        AND pid != pg_backend_pid()
      ORDER BY state_change ASC;
      `,
      [database.name]
    );

    const idleSessions = result.rows.map((row) => {
      const {
        idle_duration,
        query_preview,
        query_length,
        application_name,
        client_addr,
        state_change,
        ...rest
      } = row;

      return {
        ...rest,
        idleDuration: formatDuration(idle_duration),
        queryPreview: query_preview,
        queryLength: Number(query_length),
      };
    });

    res.json({
      success: true,
      count: idleSessions.length,
      idleSessions,
    });
  } catch (err) {
    sendSafeErrorWithMessage(res, err, "Failed to fetch idle sessions");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Database Statistics
exports.getDatabaseStatistics = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        xact_commit,
        xact_rollback,
        blks_read,
        blks_hit,
        tup_returned,
        tup_fetched,
        tup_inserted,
        tup_updated,
        tup_deleted,
        deadlocks
      FROM pg_stat_database
      WHERE datname = $1;
      `,
      [database.name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Statistics Not Found",
      });
    }

    const stats = result.rows[0];

    res.json({
      success: true,
      statistics: {
        commits: Number(stats.xact_commit),
        rollbacks: Number(stats.xact_rollback),
        blocksRead: Number(stats.blks_read),
        blocksHit: Number(stats.blks_hit),
        tuplesReturned: Number(stats.tup_returned),
        tuplesFetched: Number(stats.tup_fetched),
        tuplesInserted: Number(stats.tup_inserted),
        tuplesUpdated: Number(stats.tup_updated),
        tuplesDeleted: Number(stats.tup_deleted),
        deadlocks: Number(stats.deadlocks),
      },
    });
  } catch (err) {
    sendSafeErrorWithMessage(res, err, "Failed to fetch database statistics");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

// Get Monitoring Summary
exports.getMonitoringSummary = async (req, res) => {
  let client;

  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const database = await getOwnedDatabase(id, req.user.id);
    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    client = await connectClient(database);

    // Dashboard Data
    const versionResult = await client.query("SELECT version();");

    const sizeResult = await client.query(
      "SELECT pg_size_pretty(pg_database_size($1)) AS size;",
      [database.name]
    );

    const connectionsResult = await client.query(
      "SELECT COUNT(*)::int AS total FROM pg_stat_activity WHERE datname = $1;",
      [database.name]
    );

    // Running Queries
    const runningQueries = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'active'
        AND pid != pg_backend_pid();
      `,
      [database.name]
    );

    // Idle Sessions
    const idleSessions = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'idle'
        AND pid != pg_backend_pid();
      `,
      [database.name]
    );

    // Slow Queries
    const slowQueries = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'active'
        AND NOW() - query_start > INTERVAL '5 seconds'
        AND pid != pg_backend_pid();
      `,
      [database.name]
    );

    // Long Transactions
    const longTransactions = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM pg_stat_activity
      WHERE datname = $1
        AND xact_start IS NOT NULL
        AND NOW() - xact_start > INTERVAL '30 seconds'
        AND pid != pg_backend_pid();
      `,
      [database.name]
    );

    // Locks
    const locks = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM pg_locks l
      JOIN pg_stat_activity a
        ON l.pid = a.pid
      WHERE a.datname = $1;
      `,
      [database.name]
    );

    // Statistics
    const statistics = await client.query(
      `
      SELECT
        xact_commit,
        xact_rollback,
        deadlocks
      FROM pg_stat_database
      WHERE datname = $1;
      `,
      [database.name]
    );

    res.json({
      success: true,
      summary: {
        database: {
          id: database.id,
          name: database.name,
          version: versionResult.rows[0].version,
          size: sizeResult.rows[0].size,
          activeConnections: connectionsResult.rows[0].total,
        },
        monitoring: {
          runningQueries: runningQueries.rows[0].total,
          idleSessions: idleSessions.rows[0].total,
          slowQueries: slowQueries.rows[0].total,
          longTransactions: longTransactions.rows[0].total,
          locks: locks.rows[0].total,
        },
        statistics: {
          commits: Number(statistics.rows[0].xact_commit),
          rollbacks: Number(statistics.rows[0].xact_rollback),
          deadlocks: Number(statistics.rows[0].deadlocks),
        },
      },
    });
  } catch (err) {
    sendSafeErrorWithMessage(res, err, "Failed to fetch monitoring summary");
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};