const { getOwnedDatabase } = require("./monitoringService");

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

async function predictDatabaseFailureService(databaseId, userId) {
  const database = await getOwnedDatabase(databaseId, userId);

  if (!database) {
    return notFoundResult();
  }

  let probability = 5;
  let riskLevel = "Low";
  let status = "Healthy";
  const recommendations = [];

  // Health Score
  if (database.healthScore < 80) {
    probability += 20;
    recommendations.push("Improve database health.");
  }

  if (database.healthScore < 60) {
    probability += 20;
    riskLevel = "Medium";
    status = "Warning";
    recommendations.push("Optimize slow queries.");
  }

  if (database.healthScore < 40) {
    probability += 30;
    riskLevel = "High";
    status = "Critical";
    recommendations.push("Immediate maintenance recommended.");
  }

  // Active Connections
  if (database.activeConnections > 100) {
    probability += 15;
    recommendations.push("Reduce active connections.");
  }

  // Database Size
  if (database.databaseSize > 100) {
    probability += 10;
    recommendations.push("Archive unused data.");
  }

  if (probability > 100) {
    probability = 100;
  }

  return okResult({
    success: true,
    database: database.name,
    prediction: {
      riskLevel,
      probability: `${probability}%`,
      status,
      message:
        probability >= 70
          ? "High probability of future database issues."
          : probability >= 40
          ? "Database should be monitored closely."
          : "Database is healthy.",
      recommendations,
    },
  });
}

module.exports = {
  predictDatabaseFailureService,
};