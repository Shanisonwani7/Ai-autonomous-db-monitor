const queryOptimizerService = require("../services/queryOptimizerService");

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
    message: "Invalid Database ID",
  });
}

function sendInvalidQuery(res) {
  return res.status(400).json({
    success: false,
    message: "SQL query is required",
  });
}

// Every service method resolves to { statusCode, body } - the controller's
// only job past validation is to forward that straight to the client.
function sendResult(res, result) {
  return res.status(result.statusCode).json(result.body);
}

// ---------- Controllers ----------

// Analyze a user supplied SQL query against a database's execution plan
exports.analyzeQuery = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const { query } = req.body || {};
  if (typeof query !== "string" || !query.trim()) {
    return sendInvalidQuery(res);
  }

  const result = await queryOptimizerService.analyzeQuery(id, req.user.id, query);
  return sendResult(res, result);
};