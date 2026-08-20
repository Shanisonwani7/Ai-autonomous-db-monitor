const { getOwnedDatabase } = require("./monitoringService");
const {
  detectDatabaseAnomaly,
  predictDatabaseFailure,
} = require("./pythonAIService");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

async function generateAlertsService(databaseId, userId) {
  try {
    const database = await getOwnedDatabase(
      databaseId,
      userId
    );

    if (!database) {
      return notFoundResult();
    }

    const alerts = [];

    const history = await prisma.monitoringMetric.findMany({
      where: {
        databaseId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 20,
      select: {
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

    // Database health
    if (database.healthScore < 60) {
      alerts.push({
        type: "WARNING",
        severity: "High",
        status: "Open",
        database: database.name,
        time: new Date().toISOString(),
        message: "Database health is below the safe threshold.",
      });
    }

    // Active connections
    if (database.activeConnections > 100) {
      alerts.push({
        type: "HIGH_LOAD",
        severity: "High",
        status: "Investigating",
        database: database.name,
        time: new Date().toISOString(),
        message: "Too many active database connections detected.",
      });
    }

    // Cache hit ratio
    if (database.cacheHitRatio < 90) {
      alerts.push({
        type: "CACHE",
        severity: "Medium",
        status: "Open",
        database: database.name,
        time: new Date().toISOString(),
        message: "Cache hit ratio is below the recommended level.",
      });
    }

    // Deadlocks
    if (database.deadlocks > 0) {
      alerts.push({
        type: "DEADLOCK",
        severity: "High",
        status: "Investigating",
        database: database.name,
        time: new Date().toISOString(),
        message: "Deadlocks detected in the database.",
      });
    }

    // AI anomaly detection
    if (history.length >= 2) {
      try {
        const anomalyResult = await detectDatabaseAnomaly(
          database.name,
          history
        );

        const anomaly = anomalyResult?.anomaly;

        if (
          anomaly &&
          anomaly.status === "anomalous" &&
          anomaly.anomalyScore > 0
        ) {
          const severity =
            anomaly.riskLevel === "Critical"
              ? "High"
              : anomaly.riskLevel === "Medium"
              ? "Medium"
              : "Low";

          alerts.push({
            type: "AI_ANOMALY",
            severity,
            status:
              anomaly.riskLevel === "Critical"
                ? "Investigating"
                : "Open",
            database: database.name,
            time: new Date().toISOString(),
            message:
              anomaly.message ||
              "Unusual database activity detected by AI.",
            anomalyScore: anomaly.anomalyScore,
            riskLevel: anomaly.riskLevel,
          });
        }
      } catch (error) {
        console.error(
          "AI anomaly alert check failed:",
          error.message
        );
      }
    }

    // AI failure prediction
    if (history.length >= 2) {
      try {
        const predictionResult =
          await predictDatabaseFailure(
            database.name,
            history
          );

        const prediction = predictionResult?.prediction;

        if (
          prediction &&
          prediction.riskLevel !== "Low"
        ) {
          const severity =
            prediction.riskLevel === "High"
              ? "High"
              : "Medium";

          alerts.push({
            type: "AI_PREDICTION",
            severity,
            status:
              prediction.riskLevel === "High"
                ? "Investigating"
                : "Monitoring",
            database: database.name,
            time: new Date().toISOString(),
            message:
              prediction.message ||
              "AI detected an increased risk of future database issues.",
            probability: prediction.probability,
            riskLevel: prediction.riskLevel,
          });
        }
      } catch (error) {
        console.error(
          "AI prediction alert check failed:",
          error.message
        );
      }
    }

    // Healthy state
    if (alerts.length === 0) {
      alerts.push({
        type: "HEALTHY",
        severity: "Low",
        status: "Healthy",
        database: database.name,
        time: new Date().toISOString(),
        message: "No active alerts. Database is healthy.",
      });
    }

    return okResult({
      success: true,
      database: database.name,
      totalAlerts: alerts.length,
      generatedAt: new Date().toISOString(),
      alerts,
    });
  } catch (error) {
    console.error("Alert generation error:", error);

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
};