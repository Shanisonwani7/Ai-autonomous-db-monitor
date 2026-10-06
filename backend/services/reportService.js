const monitoringService = require("./monitoringService");
const { getHealthInsights } = require("./pythonAIService");

const MIN_HISTORY_RECORDS = 2;
const HISTORY_TAKE_LIMIT = 100;

function errorResult(error, message) {
  console.error("========== REPORT SERVICE ERROR ==========");
  console.error(error);
  console.error("==========================================");

  return {
    statusCode: 500,
    body: {
      success: false,
      message,
      error: error.message,
    },
  };
}

async function generateReport(databaseId, userId) {
  try {
    // ---------------------------------------------------------
    // 1. Get real current database monitoring summary
    // ---------------------------------------------------------
    const monitoringResult =
      await monitoringService.getMonitoringSummary(
        databaseId,
        userId
      );

    if (monitoringResult.statusCode !== 200) {
      return monitoringResult;
    }

    const summary =
      monitoringResult.body.summary;

    // ---------------------------------------------------------
    // 2. Get real historical monitoring records
    // ---------------------------------------------------------
    const historyResult =
      await monitoringService.getMonitoringHistory(
        databaseId,
        userId
      );

    if (historyResult.statusCode !== 200) {
      return historyResult;
    }

    const history =
      historyResult.body.data || [];

    // ---------------------------------------------------------
    // 3. Get real calculated trend analysis
    // ---------------------------------------------------------
    const trendResult =
      await monitoringService.getTrendAnalysis(
        databaseId,
        userId
      );

    if (trendResult.statusCode !== 200) {
      return trendResult;
    }

    const trends =
      trendResult.body.trends;

    // ---------------------------------------------------------
    // 4. Generate AI health insights from real history
    // ---------------------------------------------------------
    let insights;

    if (history.length >= MIN_HISTORY_RECORDS) {
      const aiResult = await getHealthInsights(
        summary.database.name,
        history.slice(0, HISTORY_TAKE_LIMIT)
      );

      insights = aiResult;
    } else {
      insights = {
        overallTrend: "Insufficient Data",

        healthSummary:
          "Not enough historical monitoring data to generate reliable AI insights.",

        metricTrends: {
          healthScore: "Insufficient data",
          connections: "Insufficient data",
          slowQueries: "Insufficient data",
          locks: "Insufficient data",
          cacheHitRatio: "Insufficient data",
        },

        concerns: [],

        recommendedActions: [
          "Continue collecting monitoring data before drawing long-term conclusions.",
        ],
      };
    }

    // ---------------------------------------------------------
    // 5. Build structured database report
    // ---------------------------------------------------------
    const report = {
      database: summary.database,

      monitoring: summary.monitoring,

      statistics: summary.statistics,

      historicalAnalysis: {
        recordCount:
          trends.period.recordCount,

        earliestTimestamp:
          trends.period.earliestTimestamp,

        latestTimestamp:
          trends.period.latestTimestamp,

        metrics: trends.metrics,
      },

      aiInsights: {
        overallTrend:
          insights.overallTrend,

        healthSummary:
          insights.healthSummary,

        metricTrends:
          insights.metricTrends,

        concerns:
          insights.concerns,

        recommendedActions:
          insights.recommendedActions,
      },
    };

    return {
      statusCode: 200,

      body: {
        success: true,

        generatedAt:
          new Date().toISOString(),

        report,
      },
    };
  } catch (error) {
    return errorResult(
      error,
      "Failed to generate database report"
    );
  }
}

module.exports = {
  generateReport,
};