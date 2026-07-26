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

async function generateAlertsService(databaseId, userId) {
  const database = await getOwnedDatabase(databaseId, userId);

  if (!database) {
    return notFoundResult();
  }

  const alerts = [];

  // Database Health
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

  // Active Connections
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

  // Storage
  if (database.databaseSize > 100) {
    alerts.push({
      type: "STORAGE",
      severity: "Medium",
      status: "Monitoring",
      database: database.name,
      time: new Date().toISOString(),
      message: "Database size is becoming large.",
    });
  }

  // Cache Hit Ratio
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

  // Healthy State
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
}

module.exports = {
  generateAlertsService,
};