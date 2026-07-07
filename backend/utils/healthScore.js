// Calculate Database Health Score

function calculateHealthScore(activeConnections, databaseSize, uptime) {
  let healthScore = 100;

  // Too many active connections
  if (activeConnections > 50) {
    healthScore -= 20;
  }

  // Database size missing
  if (!databaseSize) {
    healthScore -= 20;
  }

  // Uptime missing
  if (!uptime) {
    healthScore -= 20;
  }

  // Never return below 0
  if (healthScore < 0) {
    healthScore = 0;
  }

  return healthScore;
}

module.exports = {
  calculateHealthScore,
};