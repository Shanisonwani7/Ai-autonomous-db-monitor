const { PrismaClient } = require("@prisma/client");

const { getOwnedDatabase } = require("./monitoringService");
const { getHealthInsights } = require("./pythonAIService");

const prisma = new PrismaClient();

// ---------- Result helpers ----------

function notFoundResult(message = "Database Not Found") {
  return {
    statusCode: 404,
    body: {
      success: false,
      message,
    },
  };
}

function okResult(body) {
  return {
    statusCode: 200,
    body,
  };
}

function errorResultWithMessage(err, publicMessage) {
  console.error("========== HEALTH INSIGHTS SERVICE ERROR ==========");
  console.error(err);
  console.error("====================================================");

  return {
    statusCode: 500,
    body: {
      success: false,
      message: publicMessage,
      error: err.message,
    },
  };
}

// ---------- Minimum history threshold ----------

const MIN_HISTORY_RECORDS = 2;
const HISTORY_TAKE_LIMIT = 50;

function insufficientDataInsights() {
  return {
    overallTrend: "Insufficient Data",
    healthSummary: "Not enough historical monitoring data.",
    metricTrends: {
      healthScore: "Insufficient data",
      connections: "Insufficient data",
      slowQueries: "Insufficient data",
      locks: "Insufficient data",
      cacheHitRatio: "Insufficient data",
    },
    concerns: [],
    recommendedActions: [
      "Continue collecting monitoring data.",
    ],
  };
}

// ---------- Public API ----------

async function generateHealthInsights(databaseId, userId) {
  try {
    const database = await getOwnedDatabase(
      databaseId,
      userId
    );

    if (!database) {
      return notFoundResult();
    }

    const history = await prisma.monitoringMetric.findMany({
      where: {
        databaseId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: HISTORY_TAKE_LIMIT,
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

    if (history.length < MIN_HISTORY_RECORDS) {
      return okResult({
        success: true,
        database: database.name,
        insights: insufficientDataInsights(),
      });
    }

    const aiResult = await getHealthInsights(
      database.name,
      history
    );

    return okResult({
      success: true,
      database: database.name,
      insights: aiResult,
    });
  } catch (err) {
    return errorResultWithMessage(
      err,
      "Health Insights Generation Failed"
    );
  }
}

module.exports = {
  generateHealthInsights,
};