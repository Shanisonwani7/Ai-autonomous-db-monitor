const monitoringService = require("./monitoringService");

async function generateReport(databaseId, userId) {
  const monitoringResult = await monitoringService.getMonitoringSummary(
    databaseId,
    userId
  );

  if (monitoringResult.statusCode !== 200) {
    return monitoringResult;
  }

  const summary = monitoringResult.body.summary;

  return {
    statusCode: 200,
    body: {
      success: true,
      generatedAt: new Date(),
      report: {
        database: summary.database,
        monitoring: summary.monitoring,
        statistics: summary.statistics,
      },
    },
  };
}

module.exports = {
  generateReport,
};