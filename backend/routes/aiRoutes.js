const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  chat,
  recommendation,
} = require("../controllers/aiController");

// Authentication for all AI routes
router.use(protect);

// AI Assistant
// POST /api/ai/chat
router.post("/chat", chat);

// Dashboard AI Recommendation
// GET /api/ai/recommendation/:id
router.get("/recommendation/:id", recommendation);

module.exports = router;