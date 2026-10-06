const {
  generateAlertsService,
  getAlertHistoryService,
  resolveAlertService,
} = require("../services/alertService");

/*
 * ============================================================
 * GENERATE / REFRESH ALERTS
 * GET /api/alerts/:id
 * ============================================================
 */

exports.generateAlerts = async (
  req,
  res
) => {
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
      await generateAlertsService(
        databaseId,
        req.user.id
      );

    return res
      .status(result.statusCode)
      .json(result.body);
  } catch (err) {
    console.error(
      "Alert generation controller error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Alert generation failed",
    });
  }
};

/*
 * ============================================================
 * ALERT HISTORY
 * GET /api/alerts/:id/history
 * ============================================================
 */

exports.getAlertHistory = async (
  req,
  res
) => {
  try {
    const databaseId = Number(
      req.params.id
    );

    const limit = Number(
      req.query.limit || 50
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
      await getAlertHistoryService(
        databaseId,
        req.user.id,
        limit
      );

    return res
      .status(result.statusCode)
      .json(result.body);
  } catch (err) {
    console.error(
      "Alert history controller error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert history",
    });
  }
};

/*
 * ============================================================
 * RESOLVE ALERT
 * PATCH /api/alerts/:alertId/resolve
 * ============================================================
 */

exports.resolveAlert = async (
  req,
  res
) => {
  try {
    const alertId = Number(
      req.params.alertId
    );

    if (
      !Number.isInteger(alertId) ||
      alertId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid alert id",
      });
    }

    const result =
      await resolveAlertService(
        alertId,
        req.user.id
      );

    return res
      .status(result.statusCode)
      .json(result.body);
  } catch (err) {
    console.error(
      "Resolve alert controller error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to resolve alert",
    });
  }
};