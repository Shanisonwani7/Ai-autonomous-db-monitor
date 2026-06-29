const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "Healthy",
    cpu: "25%",
    memory: "48%",
    connections: 128,
    aiRecommendation: "Database performance is stable.",
  });
});

module.exports = router;