const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  addDatabase,
  getDatabases,
} = require("../controllers/databaseController");

router.post("/add", authMiddleware, addDatabase);
router.get("/list", authMiddleware, getDatabases);

module.exports = router;