const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDatabaseVersion,
  getDashboardMetrics,
  getRunningQueries,
  getDatabaseLocks,
  getSlowQueries,
  getLongRunningTransactions,
  getIdleSessions,
  getDatabaseStatistics,
  getMonitoringSummary,
} = require("../controllers/monitoringController");

// All routes require authentication
router.use(authMiddleware);

// Dashboard Metrics
router.get("/dashboard/:id", getDashboardMetrics);

// Running Queries
router.get("/running-queries/:id", getRunningQueries);

// Slow Queries
router.get("/slow-queries/:id", getSlowQueries);

// Database Version
router.get("/version/:id", getDatabaseVersion);

// Long Running Transactions
router.get("/long-transactions/:id",getLongRunningTransactions);

// Idle Sessions
router.get("/idle-sessions/:id",getIdleSessions);

// Database Locks
router.get("/locks/:id", getDatabaseLocks);

// Database Statistics
router.get("/statistics/:id", getDatabaseStatistics);

// Monitoring Summary
router.get("/summary/:id", getMonitoringSummary);

module.exports = router;