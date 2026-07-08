const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =======================
// Middlewares
// =======================
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

// =======================
// Routes
// =======================
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboard");
const databaseRoutes = require("./routes/databaseRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reportRoutes = require("./routes/reportRoutes");

// =======================
// API Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/monitor", monitoringRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);

// =======================
// Home Route
// =======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Autonomous Database Monitoring Backend Running 🚀",
  });
});

// =======================
// 404 Handler
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});