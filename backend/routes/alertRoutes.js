const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  generateAlerts,
  getAlertHistory,
  resolveAlert,
} = require("../controllers/alertController");

/*
 * All alert APIs are protected
 */
router.use(protect);

/*
 * Generate/refresh current alerts
 * GET /api/alerts/:id
 */
router.get(
  "/:id",
  generateAlerts
);

/*
 * Fetch persisted alert history
 * GET /api/alerts/:id/history
 */
router.get(
  "/:id/history",
  getAlertHistory
);

/*
 * Resolve an alert
 * PATCH /api/alerts/:alertId/resolve
 */
router.patch(
  "/:alertId/resolve",
  resolveAlert
);

module.exports = router;