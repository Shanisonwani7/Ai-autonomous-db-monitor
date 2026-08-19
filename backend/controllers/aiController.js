const { chatWithAI } = require("../services/pythonAIService");

const {
  getOwnedDatabase,
} = require("../services/monitoringService");

exports.chat = async (req, res) => {
  try {
    const { question, databaseId } = req.body;

    // Validate question
    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Validate database ID
    const id = Number(databaseId);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid databaseId is required",
      });
    }

    // Make sure the database belongs to the logged-in user
    const database = await getOwnedDatabase(
      id,
      req.user.id
    );

    if (!database) {
      return res.status(404).json({
        success: false,
        message: "Database Not Found",
      });
    }

    /*
     * Build real monitoring data from the selected database.
     *
     * Database credentials/passwords are NOT sent
     * to the AI service.
     */
    const monitoringData = {
      database: {
        id: database.id,
        name: database.name,
        dbType: database.dbType,
        host: database.host,
        port: database.port,
        databaseName: database.databaseName,
        databaseVersion: database.databaseVersion,
        status: database.status,
      },

      metrics: {
        healthScore: database.healthScore,
        activeConnections: database.activeConnections,
        databaseSize: database.databaseSize,
        uptime: database.uptime,
        lastCheck: database.lastCheck,
      },
    };

    /*
     * Send the question and real monitoring data
     * to the Python FastAPI AI Service.
     */
    const aiResponse = await chatWithAI(
      question.trim(),
      monitoringData
    );

    return res.status(200).json({
      success: true,
      answer: aiResponse.answer,
      database: database.name,
    });
  } catch (error) {
    console.error(
      "========== AI CONTROLLER ERROR =========="
    );
    console.error(error);
    console.error(
      "========================================="
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process AI request",
    });
  }
};