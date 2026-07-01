const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dashboardRoutes = require("./routes/dashboard");
const authRoutes = require("./routes/authRoutes");
const databaseRoutes = require("./routes/databaseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/database", databaseRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "AI Autonomous Database Monitoring Backend Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});