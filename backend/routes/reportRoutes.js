const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");

router.get("/:id", protect, reportController.generateReport);
router.get("/:id/pdf", protect, reportController.downloadPDF);

module.exports = router;