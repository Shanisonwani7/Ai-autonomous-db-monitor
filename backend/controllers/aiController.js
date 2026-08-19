const {
  chatWithAI,
  getAIRecommendation,
} = require("../services/pythonAIService");

const {
  getOwnedDatabase,
} = require("../services/monitoringService");

function buildMonitoringData(database) {
  return {
    database: {
      id: database.id,
      name: database.name,
      dbType: database.dbType,
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
}

exports.chat = async (req, res) => {
  try {
    const { question, databaseId } = req.body;

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

    const id = Number(databaseId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid databaseId is required",
      });
    }

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

    const monitoringData =
      buildMonitoringData(database);

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

exports.recommendation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid database id",
      });
    }

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

    const monitoringData =
      buildMonitoringData(database);

    const result =
      await getAIRecommendation(
        id,
        monitoringData
      );

    return res.status(200).json({
      success: true,
      database: database.name,
      confidence: result.confidence,
      suggestion: result.suggestion,
      estimatedGain: result.estimatedGain,
      recommendations:
        result.recommendations || [],
    });
  } catch (error) {
    console.error(
      "========== AI RECOMMENDATION ERROR =========="
    );
    console.error(error);
    console.error(
      "============================================="
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI recommendation",
    });
  }
};