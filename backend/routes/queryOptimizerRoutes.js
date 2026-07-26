const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { analyzeQuery } = require("../controllers/queryOptimizerController");

// All routes require authentication
router.use(authMiddleware);

// Analyze a query's execution plan and get AI-driven optimization advice
router.post("/:id", analyzeQuery);

module.exports = router;