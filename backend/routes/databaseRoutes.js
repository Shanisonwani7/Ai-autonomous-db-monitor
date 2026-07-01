const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addDatabase,
  getDatabases,
  updateDatabase,
  deleteDatabase,
  testConnection,
} = require("../controllers/databaseController");

// Add Database
router.post("/add", authMiddleware, addDatabase);

// Get All Databases
router.get("/list", authMiddleware, getDatabases);

// Update Database
router.put("/update/:id", authMiddleware, updateDatabase);

// Delete Database
router.delete("/delete/:id", authMiddleware, deleteDatabase);

// Test Database Connection
router.post("/test/:id", authMiddleware, testConnection);

module.exports = router;