const monitoringService = require("../services/monitoringService");

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

// Every service method resolves to { statusCode, body } - the controller's
// only job past validation is to forward that straight to the client.
function sendResult(res, result) {
  return res.status(result.statusCode).json(result.body);
}

// ---------- Controllers ----------

// Get PostgreSQL Version
exports.getDatabaseVersion = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getDatabaseVersion(id, req.user.id);
  return sendResult(res, result);
};

// Get Dashboard Metrics
exports.getDashboardMetrics = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getDashboardMetrics(id, req.user.id);
  return sendResult(res, result);
};

// Get Running Queries
exports.getRunningQueries = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getRunningQueries(id, req.user.id);
  return sendResult(res, result);
};

// Get Database Locks
exports.getDatabaseLocks = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getDatabaseLocks(id, req.user.id);
  return sendResult(res, result);
};

// Get Slow Queries
exports.getSlowQueries = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getSlowQueries(id, req.user.id);
  return sendResult(res, result);
};

// Get Long Running Transactions
exports.getLongRunningTransactions = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getLongRunningTransactions(
    id,
    req.user.id
  );
  return sendResult(res, result);
};

// Get Idle Sessions
exports.getIdleSessions = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getIdleSessions(id, req.user.id);
  return sendResult(res, result);
};

// Get Database Statistics
exports.getDatabaseStatistics = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getDatabaseStatistics(
    id,
    req.user.id
  );
  return sendResult(res, result);
};
exports.getMonitoringHistory = async (req, res) => {
  const id = parseId(req.params.id);

  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getMonitoringHistory(
    id,
    req.user.id
  );

  return sendResult(res, result);
};
// Get Monitoring Summary
exports.getMonitoringSummary = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return sendInvalidId(res);
  }

  const result = await monitoringService.getMonitoringSummary(id, req.user.id);
  return sendResult(res, result);
};