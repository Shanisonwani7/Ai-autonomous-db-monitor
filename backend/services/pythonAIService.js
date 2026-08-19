const axios = require("axios");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

const AI_SERVICE_SECRET =
  process.env.AI_SERVICE_SECRET;

/**
 * Common headers for secure communication
 * between Node.js Backend and Python AI Service.
 */
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

/**
 * Send database monitoring question to Python AI Service.
 */
async function chatWithAI(question, monitoringData) {
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
      "============================================"
    );

    throw new Error(
      "AI Service request failed"
    );
  }
}

/**
 * Send historical monitoring data to Python
 * Prediction Service.
 */
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

module.exports = {
  chatWithAI,
  predictDatabaseFailure,
};