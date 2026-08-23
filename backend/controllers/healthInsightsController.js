const { generateHealthInsights } = require("../services/healthInsightsService");

// ---------- Request validation ----------

// Parse and validate the :id route param
function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function sendInvalidId(res) {
  return res.status(400).json({
    success: false,
    message: "Invalid database id",
  });
}

// Every service method resolves to { statusCode, body } - the controller's
// only job past validation is to forward that straight to the client.
function sendResult(res, result) {
  return res.status(result.statusCode).json(result.body);
}

// ---------- Controllers ----------

// Generate AI-driven health insights from a database's monitoring history
exports.getHealthInsights = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return sendInvalidId(res);
    }

    const result = await generateHealthInsights(id, req.user.id);
    return sendResult(res, result);
  } catch (err) {
    console.error("========== HEALTH INSIGHTS CONTROLLER ERROR ==========");
    console.error(err);
    console.error("=======================================================");

    return res.status(500).json({
      success: false,
      message: "Failed to generate health insights",
    });
  }
};