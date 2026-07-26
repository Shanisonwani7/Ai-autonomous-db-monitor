const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  predictDatabaseFailure,
} = require("../controllers/predictionController");

router.use(authMiddleware);

// GET /api/prediction/:id
router.get("/:id", predictDatabaseFailure);

module.exports = router;