const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  analyzeAnomaly,
} = require("../controllers/anomalyController");

router.use(protect);

router.post(
  "/:id",
  analyzeAnomaly
);

module.exports = router;