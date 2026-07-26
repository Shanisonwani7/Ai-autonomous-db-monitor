const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { generateAlerts } = require("../controllers/alertController");

router.use(authMiddleware);

router.get("/:id", generateAlerts);

module.exports = router;