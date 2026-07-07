const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDatabaseVersion,
  getDashboardMetrics,
  getRunningQueries,
  getDatabaseLocks,
} = require("../controllers/monitoringController");

// All routes require authentication
router.use(authMiddleware);

// Dashboard Metrics
router.get("/dashboard/:id", getDashboardMetrics);

// Running Queries
router.get("/running-queries/:id", getRunningQueries);

// Database Version
router.get("/version/:id", getDatabaseVersion);

// Database Locks
router.get("/locks/:id", getDatabaseLocks);

module.exports = router;