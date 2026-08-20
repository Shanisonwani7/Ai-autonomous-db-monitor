const {
  analyzeDatabaseAnomaly,
} = require("../services/anomalyService");

exports.analyzeAnomaly = async (req, res) => {
  try {
    const databaseId = Number(
      req.params.id
    );

    if (
      !Number.isInteger(databaseId) ||
      databaseId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid database id",
      });
    }

    const result =
      await analyzeDatabaseAnomaly(
        databaseId,
        req.user.id
      );

    return res
      .status(result.statusCode)
      .json(result.body);
  } catch (error) {
    console.error(
      "========== ANOMALY CONTROLLER ERROR =========="
    );
    console.error(error);
    console.error(
      "================================================"
    );

    return res.status(500).json({
      success: false,
      message: "Anomaly detection failed",
    });
  }
};