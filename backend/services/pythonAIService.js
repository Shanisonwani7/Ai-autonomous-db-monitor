const axios = require("axios");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

const AI_SERVICE_SECRET =
  process.env.AI_SERVICE_SECRET;

function getAIServiceHeaders() {
  if (!AI_SERVICE_SECRET) {
    throw new Error(
      "AI_SERVICE_SECRET is not configured"
    );
  }

  return {
    "Content-Type": "application/json",
    "X-AI-Service-Secret": AI_SERVICE_SECRET,
  };
}

// AI Assistant
async function chatWithAI(
  question,
  monitoringData
) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/chat`,
      {
        question,
        monitoring_data: monitoringData,
      },
      {
        timeout: 30000,
        headers: getAIServiceHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "========== PYTHON AI SERVICE ERROR =========="
    );
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    console.error("============================================");

    throw new Error(
      "AI Service request failed"
    );
  }
}

// Dashboard AI Recommendation
async function getAIRecommendation(
  databaseId,
  monitoringData
) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/recommendation`,
      {
        question:
          "Analyze the current database health and provide recommendations.",
        monitoring_data: {
          databaseId,
          ...monitoringData,
        },
      },
      {
        timeout: 30000,
        headers: getAIServiceHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "========== PYTHON AI RECOMMENDATION ERROR =========="
    );
    console.error(
      "Status:",
      error.response?.status
    );
    console.error(
      "Data:",
      error.response?.data
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "===================================================="
    );

    throw new Error(
      "AI Recommendation Service request failed"
    );
  }
}

// Database Failure Prediction
async function predictDatabaseFailure(
  databaseName,
  history
) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/prediction/analyze`,
      {
        database: databaseName,
        history,
      },
      {
        timeout: 30000,
        headers: getAIServiceHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "========== PYTHON PREDICTION SERVICE ERROR =========="
    );
    console.error(
      "Status:",
      error.response?.status
    );
    console.error(
      "Data:",
      error.response?.data
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "===================================================="
    );

    throw new Error(
      "Prediction AI Service request failed"
    );
  }
}

// Database Anomaly Detection
async function detectDatabaseAnomaly(
  databaseName,
  history
) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/anomaly/analyze`,
      {
        database: databaseName,
        history,
      },
      {
        timeout: 30000,
        headers: getAIServiceHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "========== PYTHON ANOMALY SERVICE ERROR =========="
    );
    console.error(
      "Status:",
      error.response?.status
    );
    console.error(
      "Data:",
      error.response?.data
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "=================================================="
    );

    throw new Error(
      "Anomaly AI Service request failed"
    );
  }
}

module.exports = {
  chatWithAI,
  getAIRecommendation,
  predictDatabaseFailure,
  detectDatabaseAnomaly,
};