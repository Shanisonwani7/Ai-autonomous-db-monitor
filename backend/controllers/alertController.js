const { generateAlertsService } = require("../services/alertService");

exports.generateAlerts = async (req, res) => {
  try {
    const databaseId = Number(req.params.id);

    if (!databaseId || Number.isNaN(databaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid database id",
      });
    }

    const result = await generateAlertsService(databaseId, req.user.id);

    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Alert generation failed",
      error: err.message,
    });
  }
};