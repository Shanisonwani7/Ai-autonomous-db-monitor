const crypto = require("crypto");
const prisma = require("../config/prisma");
const { Client } = require("pg");
const { calculateHealthScore } = require("../utils/healthScore");
const { formatDuration } = require("../utils/formatDuration");

const ALGORITHM = "aes-256-gcm";
const RAW_KEY = process.env.DB_CREDENTIALS_ENCRYPTION_KEY;

if (!RAW_KEY || Buffer.from(RAW_KEY, "hex").length !== 32) {
  throw new Error(
    "DB_CREDENTIALS_ENCRYPTION_KEY is missing or is not a valid 32-byte hex string"
  );
}
const ENCRYPTION_KEY = Buffer.from(RAW_KEY, "hex");

const CONNECT_TIMEOUT_MS = 5000;
const STATEMENT_TIMEOUT_MS = 5000;
const RUNNING_QUERIES_LIMIT = 100;

function isUnsupportedDbType(dbType) {
  if (!dbType) return false;
  const normalized = dbType.toLowerCase();
  return normalized !== "postgresql" && normalized !== "postgres";
}

// The real PostgreSQL database name to query against. `name` is just the
// user-facing display name; `databaseName` (when set) is the actual one.
function getActualDatabaseName(database) {
  return database.databaseName || database.name;
}

// ---------- Crypto ----------

function encryptPassword(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // stored format: iv:authTag:ciphertext (all hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString(
    "hex"
  )}`;
}

function decryptPassword(encryptedPassword) {
  try {
    const parts = (encryptedPassword || "").split(":");
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
    // normalize so callers don't see raw crypto internals
    const wrapped = new Error("Failed to decrypt stored database credentials");
    wrapped.cause = err;
    throw wrapped;
  }
}

async function getOwnedDatabase(id, userId) {
  return prisma.database.findFirst({ where: { id, userId } });
}

// Only place a pg.Client is ever constructed in this app.
async function connectClient(database) {
  const password = decryptPassword(database.password);

  const client = new Client({
    host: database.host,
    port: database.port,
    user: database.username,
    password,
    database: getActualDatabaseName(database),
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    statement_timeout: STATEMENT_TIMEOUT_MS,
    query_timeout: STATEMENT_TIMEOUT_MS,
    ssl: database.ssl ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();
  return client;
}

// ---------- Result helpers ----------
// Service methods resolve to { statusCode, body }; controllers just pass it through.

function notFoundResult(message = "Database Not Found") {
  return { statusCode: 404, body: { success: false, message } };
}

function okResult(body) {
  return { statusCode: 200, body };
}

function errorResult(err, publicMessage) {
  console.error(err);
  return { statusCode: 500, body: { success: false, message: publicMessage } };
}

function errorResultWithMessage(err, publicMessage) {
  console.error(err);
  return {
    statusCode: 500,
    body: { success: false, message: publicMessage, error: err.message },
  };
}

function formatUptime(interval) {
  if (!interval) return null;
  const parts = [];
  if (interval.years) parts.push(`${interval.years} Years`);
  if (interval.months) parts.push(`${interval.months} Months`);
  parts.push(`${interval.days || 0} Days`);
  parts.push(`${interval.hours || 0} Hours`);
  parts.push(`${interval.minutes || 0} Minutes`);
  return parts.join(" ");
}

// ---------- Shared connection test / metrics refresh ----------
// Used by databaseController.addDatabase / updateDatabase / testConnection,
// and by getDashboardMetrics below. No other function opens a pg.Client for this.
async function refreshConnectionStatus(database) {
  if (isUnsupportedDbType(database.dbType)) {
    return {
      success: false,
      skipped: true,
      errorCode: "UNSUPPORTED_DB_TYPE",
      errorMessage: `Connection testing for '${database.dbType}' is not supported yet`,
    };
  }

  let client;

  try {
    client = await connectClient(database);

    const dbName = getActualDatabaseName(database);

    const versionResult = await client.query("SELECT version();");
    const sizeResult = await client.query(
      "SELECT pg_size_pretty(pg_database_size($1)) AS size;",
      [dbName]
    );
    const connectionResult = await client.query(
      "SELECT COUNT(*) AS total FROM pg_stat_activity WHERE datname = $1;",
      [dbName]
    );
    const uptimeResult = await client.query(
      "SELECT now() - pg_postmaster_start_time() AS uptime;"
    );

    // ----- Session 8: pg_stat_database monitoring metrics -----
    const statsResult = await client.query(
      `SELECT xact_commit, xact_rollback, blks_read, blks_hit, deadlocks
       FROM pg_stat_database
       WHERE datname = $1;`,
      [dbName]
    );

    const statsRow = statsResult.rows[0] || {};
    const commits = Number(statsRow.xact_commit || 0);
    const rollbacks = Number(statsRow.xact_rollback || 0);
    const blocksRead = Number(statsRow.blks_read || 0);
    const blocksHit = Number(statsRow.blks_hit || 0);
    const deadlocks = Number(statsRow.deadlocks || 0);

    const totalBlockAccesses = blocksHit + blocksRead;
    const cacheHitRatio =
      totalBlockAccesses > 0
        ? Number(((blocksHit / totalBlockAccesses) * 100).toFixed(2))
        : 0;
    // ------------------------------------------------------------

    const version = versionResult.rows[0].version;
    const databaseSize = sizeResult.rows[0].size;
    const activeConnections = Number(connectionResult.rows[0].total);
    const uptime = formatUptime(uptimeResult.rows[0].uptime);

    const healthScore = calculateHealthScore(
      activeConnections,
      databaseSize,
      uptime
    );
    const lastCheck = new Date();

    const updated = await prisma.database.update({
      where: { id: database.id },
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

    return {
      success: true,
      database: updated,
      metrics: {
        status: "Connected",
        databaseVersion: version,
        databaseSize,
        activeConnections,
        uptime,
        healthScore,
        // ----- Session 8: additional monitoring metrics -----
        commits,
        rollbacks,
        deadlocks,
        cacheHitRatio,
        // ------------------------------------------------------
      },
    };
  } catch (err) {
    console.error("Database connection refresh failed:", err.message);

    const isDecryptError =
      err.message === "Failed to decrypt stored database credentials";

    let updated;
    try {
      updated = await prisma.database.update({
        where: { id: database.id },
        data: {
          status: "Disconnected",
          healthScore: 0,
          databaseVersion: null,
          databaseSize: null,
          activeConnections: 0,
          uptime: null,
          lastCheck: new Date(),
        },
      });
    } catch (updateErr) {
      console.error("Failed to update database status:", updateErr.message);
    }

    return {
      success: false,
      errorCode: isDecryptError ? "DECRYPT_FAILED" : "CONNECTION_FAILED",
      errorMessage: isDecryptError
        ? "Could not decrypt stored credentials. Please re-save the database password."
        : err.message,
      database: updated,
    };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeErr) {
        console.error("Failed to close client:", closeErr.message);
      }
    }
  }
}

// ---------- Service methods ----------

async function getDatabaseVersion(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);
    const result = await client.query("SELECT version();");

    return okResult({
      success: true,
      database: database.name,
      version: result.rows[0].version,
    });
  } catch (err) {
    return errorResult(err, "Failed to retrieve database version");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

// Delegates to refreshConnectionStatus() — no duplicate query logic here.
async function getDashboardMetrics(id, userId) {
  const database = await getOwnedDatabase(id, userId);
  if (!database) return notFoundResult();

  const result = await refreshConnectionStatus(database);

  if (!result.success) {
    if (result.errorCode === "UNSUPPORTED_DB_TYPE") {
      return { statusCode: 400, body: { success: false, message: result.errorMessage } };
    }
    return {
      statusCode: 500,
      body: {
        success: false,
        message: "Database Monitoring Failed",
        error: result.errorMessage,
      },
    };
  }

  const { metrics } = result;

  return okResult({
    success: true,
    database: {
      id: database.id,
      name: database.name,
      type: database.dbType,
      host: database.host,
      port: database.port,
      status: metrics.status,
      version: metrics.databaseVersion,
      databaseSize: metrics.databaseSize,
      activeConnections: metrics.activeConnections,
      uptime: metrics.uptime,
      healthScore: metrics.healthScore,
      lastCheck: result.database.lastCheck,
      // ----- Session 8: additional monitoring metrics -----
      commits: metrics.commits,
      rollbacks: metrics.rollbacks,
      deadlocks: metrics.deadlocks,
      cacheHitRatio: metrics.cacheHitRatio,
      // ------------------------------------------------------
    },
  });
}

async function getRunningQueries(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid, usename, datname, state,
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
      [getActualDatabaseName(database), RUNNING_QUERIES_LIMIT]
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

    return okResult({ success: true, count: queries.length, queries });
  } catch (err) {
    return errorResult(err, "Failed to fetch running queries");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

async function getDatabaseLocks(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        l.pid, a.usename, a.datname, l.locktype, l.mode, l.granted, a.state,
        LEFT(a.query, 300) AS query
      FROM pg_locks l
      JOIN pg_stat_activity a ON l.pid = a.pid
      WHERE a.datname = $1
      ORDER BY l.granted DESC;
      `,
      [getActualDatabaseName(database)]
    );

    return okResult({ success: true, count: result.rows.length, locks: result.rows });
  } catch (err) {
    return errorResultWithMessage(err, "Failed to fetch database locks");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

async function getSlowQueries(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid, usename, datname, state,
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
      [getActualDatabaseName(database)]
    );

    const slowQueries = result.rows.map((row) => {
      const { duration, query_preview, query_length, ...rest } = row;
      return {
        ...rest,
        duration: formatDuration(duration),
        queryPreview: query_preview,
        queryLength: Number(query_length),
      };
    });

    return okResult({ success: true, count: slowQueries.length, slowQueries });
  } catch (err) {
    return errorResultWithMessage(err, "Failed to fetch slow queries");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

async function getLongRunningTransactions(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid, usename, datname, state, xact_start,
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
      [getActualDatabaseName(database)]
    );

    const transactions = result.rows.map((row) => {
      const { transaction_duration, query_preview, query_length, ...rest } = row;
      return {
        ...rest,
        transactionDuration: formatDuration(transaction_duration),
        queryPreview: query_preview,
        queryLength: Number(query_length),
      };
    });

    return okResult({ success: true, count: transactions.length, transactions });
  } catch (err) {
    return errorResultWithMessage(err, "Failed to fetch long running transactions");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

async function getIdleSessions(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        pid, usename, datname, application_name, client_addr, state, state_change,
        NOW() - state_change AS idle_duration,
        LEFT(query, 150) AS query_preview,
        LENGTH(query) AS query_length
      FROM pg_stat_activity
      WHERE datname = $1
        AND state = 'idle'
        AND pid != pg_backend_pid()
      ORDER BY state_change ASC;
      `,
      [getActualDatabaseName(database)]
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

    return okResult({ success: true, count: idleSessions.length, idleSessions });
  } catch (err) {
    return errorResultWithMessage(err, "Failed to fetch idle sessions");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

async function getDatabaseStatistics(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const result = await client.query(
      `
      SELECT
        xact_commit, xact_rollback, blks_read, blks_hit,
        tup_returned, tup_fetched, tup_inserted, tup_updated, tup_deleted, deadlocks
      FROM pg_stat_database
      WHERE datname = $1;
      `,
      [getActualDatabaseName(database)]
    );

    if (result.rows.length === 0) return notFoundResult("Statistics Not Found");

    const stats = result.rows[0];

    return okResult({
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
    return errorResultWithMessage(err, "Failed to fetch database statistics");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

async function getMonitoringSummary(id, userId) {
  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    const dbName = getActualDatabaseName(database);

    const versionResult = await client.query("SELECT version();");
    const sizeResult = await client.query(
      "SELECT pg_size_pretty(pg_database_size($1)) AS size;",
      [dbName]
    );
    const connectionsResult = await client.query(
      "SELECT COUNT(*)::int AS total FROM pg_stat_activity WHERE datname = $1;",
      [dbName]
    );
    const runningQueries = await client.query(
      `SELECT COUNT(*)::int AS total FROM pg_stat_activity
       WHERE datname = $1 AND state = 'active' AND pid != pg_backend_pid();`,
      [dbName]
    );
    const idleSessions = await client.query(
      `SELECT COUNT(*)::int AS total FROM pg_stat_activity
       WHERE datname = $1 AND state = 'idle' AND pid != pg_backend_pid();`,
      [dbName]
    );
    const slowQueries = await client.query(
      `SELECT COUNT(*)::int AS total FROM pg_stat_activity
       WHERE datname = $1 AND state = 'active'
         AND NOW() - query_start > INTERVAL '5 seconds' AND pid != pg_backend_pid();`,
      [dbName]
    );
    const longTransactions = await client.query(
      `SELECT COUNT(*)::int AS total FROM pg_stat_activity
       WHERE datname = $1 AND xact_start IS NOT NULL
         AND NOW() - xact_start > INTERVAL '30 seconds' AND pid != pg_backend_pid();`,
      [dbName]
    );
    const locks = await client.query(
      `SELECT COUNT(*)::int AS total FROM pg_locks l
       JOIN pg_stat_activity a ON l.pid = a.pid WHERE a.datname = $1;`,
      [dbName]
    );
    const statistics = await client.query(
      `SELECT xact_commit, xact_rollback, deadlocks FROM pg_stat_database WHERE datname = $1;`,
      [dbName]
    );

    return okResult({
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
    return errorResultWithMessage(err, "Failed to fetch monitoring summary");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}
async function collectHistoricalMetrics(database) {
  let client;

  try {
    client = await connectClient(database);

    const dbName = getActualDatabaseName(database);

    const result = await client.query(`
      SELECT
        (SELECT COUNT(*)::int
         FROM pg_stat_activity
         WHERE datname = $1) AS active_connections,

        (SELECT pg_size_pretty(pg_database_size($1))) AS database_size,

        (SELECT xact_commit
         FROM pg_stat_database
         WHERE datname = $1) AS commits,

        (SELECT xact_rollback
         FROM pg_stat_database
         WHERE datname = $1) AS rollbacks,

        (SELECT deadlocks
         FROM pg_stat_database
         WHERE datname = $1) AS deadlocks,

        (SELECT COUNT(*)::int
         FROM pg_stat_activity
         WHERE datname = $1
         AND state = 'active'
         AND pid != pg_backend_pid()) AS running_queries,

        (SELECT COUNT(*)::int
         FROM pg_stat_activity
         WHERE datname = $1
         AND state = 'active'
         AND NOW() - query_start > INTERVAL '5 seconds'
         AND pid != pg_backend_pid()) AS slow_queries,

        (SELECT COUNT(*)::int
         FROM pg_stat_activity
         WHERE datname = $1
         AND state = 'idle'
         AND pid != pg_backend_pid()) AS idle_sessions,

        (SELECT COUNT(*)::int
         FROM pg_locks l
         JOIN pg_stat_activity a ON l.pid = a.pid
         WHERE a.datname = $1) AS locks
    `, [dbName]);

    const data = result.rows[0];

    const activeConnections = Number(data.active_connections || 0);
    const commits = Number(data.commits || 0);
    const rollbacks = Number(data.rollbacks || 0);
    const deadlocks = Number(data.deadlocks || 0);
    const runningQueries = Number(data.running_queries || 0);
    const slowQueries = Number(data.slow_queries || 0);
    const idleSessions = Number(data.idle_sessions || 0);
    const locks = Number(data.locks || 0);

    const historicalMetric = await prisma.monitoringMetric.create({
      data: {
        databaseId: database.id,
        activeConnections,
        databaseSize: data.database_size,
        commits,
        rollbacks,
        deadlocks,
        runningQueries,
        slowQueries,
        locks,
        idleSessions,
      },
    });

    return {
      success: true,
      metric: historicalMetric,
    };
  } catch (err) {
    console.error("Historical monitoring failed:", err.message);

    return {
      success: false,
      errorMessage: err.message,
    };
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
}
async function getMonitoringHistory(databaseId, userId) {
  try {
    const database = await getOwnedDatabase(databaseId, userId);

    if (!database) {
      return {
        statusCode: 404,
        body: {
          success: false,
          message: "Database not found",
        },
      };
    }

    const metrics = await prisma.monitoringMetric.findMany({
      where: {
        databaseId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
    });

    return {
      statusCode: 200,
      body: {
        success: true,
        data: metrics,
      },
    };
  } catch (error) {
    console.error("Get monitoring history error:", error);

    return {
      statusCode: 500,
      body: {
        success: false,
        message: "Failed to fetch monitoring history",
      },
    };
  }
}
module.exports = {
  encryptPassword,
  getMonitoringHistory,
  decryptPassword,
  connectClient,
  getOwnedDatabase,
  getActualDatabaseName,
  refreshConnectionStatus,
  getDatabaseVersion,
  getDashboardMetrics,
  getRunningQueries,
  getDatabaseLocks,
  getSlowQueries,
  getLongRunningTransactions,
  getIdleSessions,
  getDatabaseStatistics,
  getMonitoringSummary,
  collectHistoricalMetrics,
};