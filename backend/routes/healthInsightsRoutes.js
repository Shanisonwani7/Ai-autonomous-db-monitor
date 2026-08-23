const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { getHealthInsights } = require("../controllers/healthInsightsController");

// All routes require authentication
router.use(authMiddleware);

// Get AI-driven health insights for a database's monitoring history
router.get("/:id", getHealthInsights);

module.exports = router;