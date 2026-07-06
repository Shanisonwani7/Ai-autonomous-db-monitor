const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware
app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("BODY:", req.body);
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboard");
const databaseRoutes = require("./routes/databaseRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes"); // NEW
const userRoutes = require("./routes/userRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/monitor", monitoringRoutes); // NEW
app.use("/api/users", userRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "AI Autonomous Database Monitoring Backend Running 🚀",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});