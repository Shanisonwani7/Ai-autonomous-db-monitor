const {
  predictDatabaseFailureService,
} = require("../services/predictionService");

exports.predictDatabaseFailure = async (req, res) => {
  try {
    const databaseId = Number(req.params.id);

    if (!databaseId || Number.isNaN(databaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid database id",
      });
    }

    const result = await predictDatabaseFailureService(
      databaseId,
      req.user.id
    );

    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Prediction Failed",
      error: err.message,
    });
  }
};