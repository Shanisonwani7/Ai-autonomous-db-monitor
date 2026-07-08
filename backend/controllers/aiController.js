const aiService = require("../services/aiService");
const monitoringService = require("../services/monitoringService");

exports.chat = async (req, res) => {
  try {
    const { question, databaseId } = req.body;
    if (!databaseId) {
    return res.status(400).json({
       success: false,
       message: "Database ID is required",
    });
  }

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }
    const monitoringResult = await monitoringService.getMonitoringSummary(
        databaseId,
     req.user.id
    );
    const answer = await aiService.generateResponse(
        question,
        monitoringResult.body.summary
    );

    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
};