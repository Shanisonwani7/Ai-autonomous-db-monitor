const {
  getOwnedDatabase,
} = require("./monitoringService");

const {
  detectDatabaseAnomaly,
} = require("./pythonAIService");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function analyzeDatabaseAnomaly(
  databaseId,
  userId
) {
  try {
    const database =
      await getOwnedDatabase(
        databaseId,
        userId
      );

    if (!database) {
      return {
        statusCode: 404,
        body: {
          success: false,
          message: "Database Not Found",
        },
      };
    }

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

    if (history.length < 2) {
      return {
        statusCode: 200,
        body: {
          success: true,
          database: database.name,
          anomaly: {
            status: "insufficient_data",
            anomalyScore: 0,
            riskLevel: "Unknown",
            anomalies: [],
            message:
              "Not enough historical monitoring data.",
          },
        },
      };
    }

    const result =
      await detectDatabaseAnomaly(
        database.name,
        history
      );

    return {
      statusCode: 200,
      body: result,
    };
  } catch (error) {
    console.error(
      "========== ANOMALY SERVICE ERROR =========="
    );
    console.error(error);
    console.error(
      "==========================================="
    );

    return {
      statusCode: 500,
      body: {
        success: false,
        message: "Anomaly Detection Failed",
        error: error.message,
      },
    };
  }
}

module.exports = {
  analyzeDatabaseAnomaly,
};
