const {
  getOwnedDatabase,
} = require("./monitoringService");

const {
  detectDatabaseAnomaly,
  predictDatabaseFailure,
} = require("./pythonAIService");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/*
 * ============================================================
 * RESULT HELPERS
 * ============================================================
 */

function okResult(body) {
  return {
    statusCode: 200,
    body,
  };
}

function notFoundResult() {
  return {
    statusCode: 404,
    body: {
      success: false,
      message: "Database Not Found",
    },
  };
}

/*
 * ============================================================
 * NORMALIZE ALERT OBJECT
 * ============================================================
 */

function normalizeAlert({
  databaseId,
  type,
  severity,
  status,
  message,
  metric = null,
  threshold = null,
  actualValue = null,
  anomalyScore = null,
  riskLevel = null,
  probability = null,
}) {
  return {
    databaseId,
    type,
    severity,
    status,
    message,
    metric,
    threshold,
    actualValue,
    anomalyScore,
    riskLevel,
    probability,
  };
}

/*
 * ============================================================
 * CREATE OR UPDATE OPEN ALERT
 *
 * Important:
 * Same alert type ke multiple duplicate records create nahi honge
 * jab tak previous alert unresolved/open hai.
 * ============================================================
 */

async function upsertOpenAlert(alertData) {
  const existing = await prisma.alert.findFirst({
    where: {
      databaseId: alertData.databaseId,
      type: alertData.type,
      resolvedAt: null,
      status: {
        not: "Resolved",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existing) {
    return prisma.alert.update({
      where: {
        id: existing.id,
      },
      data: {
        severity: alertData.severity,
        status: alertData.status,
        message: alertData.message,
        metric: alertData.metric,
        threshold: alertData.threshold,
        actualValue: alertData.actualValue,
        anomalyScore: alertData.anomalyScore,
        riskLevel: alertData.riskLevel,
        probability: alertData.probability,
      },
    });
  }

  return prisma.alert.create({
    data: {
      ...alertData,
    },
  });
}

/*
 * ============================================================
 * RESOLVE ALERTS WHICH ARE NO LONGER ACTIVE
 *
 * Example:
 * Slow queries > 5
 *       ↓
 * Alert Open
 *
 * Later slow queries become 0
 *       ↓
 * Alert Resolved
 * ============================================================
 */

async function resolveInactiveAlertTypes(
  databaseId,
  activeTypes
) {
  const where = {
    databaseId,
    resolvedAt: null,
    status: {
      not: "Resolved",
    },
  };

  if (activeTypes.length > 0) {
    where.type = {
      notIn: activeTypes,
    };
  }

  await prisma.alert.updateMany({
    where,
    data: {
      status: "Resolved",
      resolvedAt: new Date(),
    },
  });
}

/*
 * ============================================================
 * GET ALERT HISTORY
 * ============================================================
 */

async function getAlertHistoryService(
  databaseId,
  userId,
  limit = 50
) {
  const database = await getOwnedDatabase(
    databaseId,
    userId
  );

  if (!database) {
    return notFoundResult();
  }

  const alerts = await prisma.alert.findMany({
    where: {
      databaseId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: Math.min(Number(limit) || 50, 100),
  });

  return okResult({
    success: true,
    database: database.name,
    totalAlerts: alerts.length,
    alerts,
  });
}

/*
 * ============================================================
 * RESOLVE SINGLE ALERT
 * ============================================================
 */

async function resolveAlertService(
  alertId,
  userId
) {
  const alert = await prisma.alert.findFirst({
    where: {
      id: alertId,
      database: {
        userId,
      },
    },
    include: {
      database: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!alert) {
    return {
      statusCode: 404,
      body: {
        success: false,
        message: "Alert Not Found",
      },
    };
  }

  if (alert.status === "Resolved") {
    return okResult({
      success: true,
      message: "Alert is already resolved",
      alert,
    });
  }

  const resolvedAlert = await prisma.alert.update({
    where: {
      id: alertId,
    },
    data: {
      status: "Resolved",
      resolvedAt: new Date(),
    },
  });

  return okResult({
    success: true,
    message: "Alert resolved successfully",
    alert: resolvedAlert,
  });
}

/*
 * ============================================================
 * MAIN ALERT GENERATION
 * ============================================================
 */

async function generateAlertsService(
  databaseId,
  userId
) {
  try {
    const database = await getOwnedDatabase(
      databaseId,
      userId
    );

    if (!database) {
      return notFoundResult();
    }

    /*
     * Get latest historical monitoring data.
     * Ye wahi real records hain jo MonitoringWorker
     * PostgreSQL se collect kar raha hai.
     */

    const history =
      await prisma.monitoringMetric.findMany({
        where: {
          databaseId,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 20,
        select: {
          id: true,
          timestamp: true,
          activeConnections: true,
          runningQueries: true,
          slowQueries: true,
          deadlocks: true,
          locks: true,
          longTransactions: true,
          idleSessions: true,
          cacheHitRatio: true,
          healthScore: true,
          databaseSize: true,
        },
      });

    /*
     * No historical monitoring data
     */

    if (history.length === 0) {
      return okResult({
        success: true,
        database: database.name,
        totalAlerts: 0,
        generatedAt: new Date().toISOString(),
        alerts: [],
        message:
          "No monitoring history is available yet.",
      });
    }

    const latest = history[0];

    /*
     * Active alert types during this generation cycle
     */

    const activeTypes = [];

    /*
     * ========================================================
     * 1. DATABASE HEALTH
     * ========================================================
     */

    const healthScore = Number(
      latest.healthScore ??
        database.healthScore ??
        0
    );

    if (healthScore < 60) {
      activeTypes.push("DATABASE_HEALTH");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "DATABASE_HEALTH",
          severity:
            healthScore < 40
              ? "Critical"
              : "High",
          status:
            healthScore < 40
              ? "Critical"
              : "Open",
          message:
            "Database health is below the safe threshold.",
          metric: "healthScore",
          threshold: 60,
          actualValue: healthScore,
        })
      );
    }

    /*
     * ========================================================
     * 2. ACTIVE CONNECTIONS
     *
     * Current threshold = 100
     * ========================================================
     */

    const activeConnections = Number(
      latest.activeConnections ?? 0
    );

    if (activeConnections > 100) {
      activeTypes.push("HIGH_LOAD");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "HIGH_LOAD",
          severity: "High",
          status: "Investigating",
          message:
            "Too many active database connections detected.",
          metric: "activeConnections",
          threshold: 100,
          actualValue: activeConnections,
        })
      );
    }

    /*
     * ========================================================
     * 3. CACHE HIT RATIO
     * ========================================================
     */

    const cacheHitRatio =
      latest.cacheHitRatio === null ||
      latest.cacheHitRatio === undefined
        ? null
        : Number(latest.cacheHitRatio);

    if (
      cacheHitRatio !== null &&
      cacheHitRatio < 90
    ) {
      activeTypes.push("CACHE");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "CACHE",
          severity: "Medium",
          status: "Open",
          message:
            "Cache hit ratio is below the recommended level.",
          metric: "cacheHitRatio",
          threshold: 90,
          actualValue: cacheHitRatio,
        })
      );
    }

    /*
     * ========================================================
     * 4. DEADLOCKS
     * ========================================================
     */

    const deadlocks = Number(
      latest.deadlocks ?? 0
    );

    if (deadlocks > 0) {
      activeTypes.push("DEADLOCK");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "DEADLOCK",
          severity: "High",
          status: "Investigating",
          message:
            "Deadlocks detected in the database.",
          metric: "deadlocks",
          threshold: 0,
          actualValue: deadlocks,
        })
      );
    }

    /*
     * ========================================================
     * 5. SLOW QUERIES
     * ========================================================
     */

    const slowQueries = Number(
      latest.slowQueries ?? 0
    );

    if (slowQueries >= 5) {
      activeTypes.push("SLOW_QUERY");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "SLOW_QUERY",
          severity:
            slowQueries >= 20
              ? "High"
              : "Medium",
          status: "Open",
          message:
            "Multiple slow queries are currently detected.",
          metric: "slowQueries",
          threshold: 5,
          actualValue: slowQueries,
        })
      );
    }

    /*
     * ========================================================
     * 6. LONG TRANSACTIONS
     * ========================================================
     */

    const longTransactions = Number(
      latest.longTransactions ?? 0
    );

    if (longTransactions > 0) {
      activeTypes.push("LONG_TRANSACTION");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "LONG_TRANSACTION",
          severity:
            longTransactions >= 5
              ? "High"
              : "Medium",
          status: "Open",
          message:
            "Long-running transactions detected.",
          metric: "longTransactions",
          threshold: 0,
          actualValue: longTransactions,
        })
      );
    }

    /*
     * ========================================================
     * 7. LOCK CONTENTION
     * ========================================================
     *
     * Normal locks alone are not automatically critical.
     */

    const locks = Number(
      latest.locks ?? 0
    );

    const runningQueries = Number(
      latest.runningQueries ?? 0
    );

    if (locks >= 20) {
      activeTypes.push("LOCK_CONTENTION");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "LOCK_CONTENTION",
          severity: "High",
          status: "Investigating",
          message:
            "High lock contention detected in the database.",
          metric: "locks",
          threshold: 20,
          actualValue: locks,
        })
      );
    } else if (
      locks >= 15 &&
      runningQueries > 0
    ) {
      activeTypes.push("LOCK_CONTENTION");

      await upsertOpenAlert(
        normalizeAlert({
          databaseId,
          type: "LOCK_CONTENTION",
          severity: "Medium",
          status: "Monitoring",
          message:
            "Elevated lock activity detected while queries are running.",
          metric: "locks",
          threshold: 15,
          actualValue: locks,
        })
      );
    }

    /*
     * ========================================================
     * 8. AI ANOMALY DETECTION
     * ========================================================
     */

    if (history.length >= 2) {
      try {
        const anomalyResult =
          await detectDatabaseAnomaly(
            database.name,
            history
          );

        const anomaly =
          anomalyResult?.anomaly;

        if (
          anomaly &&
          anomaly.status === "anomalous" &&
          Number(anomaly.anomalyScore ?? 0) > 0
        ) {
          const severity =
            anomaly.riskLevel === "Critical"
              ? "High"
              : anomaly.riskLevel === "Medium"
              ? "Medium"
              : "Low";

          activeTypes.push("AI_ANOMALY");

          await upsertOpenAlert(
            normalizeAlert({
              databaseId,
              type: "AI_ANOMALY",
              severity,
              status:
                anomaly.riskLevel === "Critical"
                  ? "Investigating"
                  : "Open",
              message:
                anomaly.message ||
                "Unusual database activity detected by AI.",
              anomalyScore:
                Number(anomaly.anomalyScore),
              riskLevel:
                anomaly.riskLevel || null,
            })
          );
        }
      } catch (error) {
        console.error(
          "AI anomaly alert check failed:",
          error.message
        );
      }
    }

    /*
     * ========================================================
     * 9. AI FAILURE PREDICTION
     * ========================================================
     */

    if (history.length >= 2) {
      try {
        const predictionResult =
          await predictDatabaseFailure(
            database.name,
            history
          );

        const prediction =
          predictionResult?.prediction;

        if (
          prediction &&
          prediction.riskLevel !== "Low" &&
          prediction.riskLevel !== "Healthy"
        ) {
          const severity =
            prediction.riskLevel === "High"
              ? "High"
              : "Medium";

          activeTypes.push("AI_PREDICTION");

          await upsertOpenAlert(
            normalizeAlert({
              databaseId,
              type: "AI_PREDICTION",
              severity,
              status:
                prediction.riskLevel === "High"
                  ? "Investigating"
                  : "Monitoring",
              message:
                prediction.message ||
                "AI detected an increased risk of future database issues.",
              probability:
                prediction.probability || null,
              riskLevel:
                prediction.riskLevel || null,
            })
          );
        }
      } catch (error) {
        console.error(
          "AI prediction alert check failed:",
          error.message
        );
      }
    }

    /*
     * 10. RESOLVE INACTIVE ALERTS
     */

    await resolveInactiveAlertTypes(
      databaseId,
      activeTypes
    );

    /*
     * 11. FETCH CURRENT ALERTS FROM DATABASE
     */

    const alerts =
      await prisma.alert.findMany({
        where: {
          databaseId,
          status: {
            not: "Resolved",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

    /*
     * Healthy state:
     * Database me fake "HEALTHY" alert create nahi karenge.
     */

    return okResult({
      success: true,
      database: database.name,
      totalAlerts: alerts.length,
      generatedAt: new Date().toISOString(),
      alerts,
    });
  } catch (error) {
    console.error(
      "Alert generation error:",
      error
    );

    return {
      statusCode: 500,
      body: {
        success: false,
        message: "Alert generation failed",
        error: error.message,
      },
    };
  }
}

module.exports = {
  generateAlertsService,
  getAlertHistoryService,
  resolveAlertService,
};