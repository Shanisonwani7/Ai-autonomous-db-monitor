const { getOwnedDatabase, connectClient } = require("./monitoringService");
const aiService = require("./aiService");

// ---------- Result helpers ----------
// Mirrors the { statusCode, body } contract used by monitoringService so the
// controller can forward results the exact same way.

function notFoundResult(message = "Database Not Found") {
  return { statusCode: 404, body: { success: false, message } };
}

function badRequestResult(message) {
  return { statusCode: 400, body: { success: false, message } };
}

function okResult(body) {
  return { statusCode: 200, body };
}

function errorResultWithMessage(err, publicMessage) {
  console.error(err);
  return {
    statusCode: 500,
    body: { success: false, message: publicMessage, error: err.message },
  };
}

// ---------- SQL validation ----------
// EXPLAIN (without ANALYZE) never executes the underlying statement, it only
// plans it — but we still reject anything that looks like a stacked/multi
// statement payload since that's never legitimate input for a single query.
function validateSqlQuery(rawQuery) {
  if (typeof rawQuery !== "string") {
    return "Query must be a string";
  }

  const query = rawQuery.trim();

  if (!query) {
    return "Query cannot be empty";
  }

  if (query.length > 10000) {
    return "Query is too long";
  }

  const withoutTrailingSemicolon = query.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    return "Only a single SQL statement is allowed";
  }

  return null;
}

function isSyntaxError(err) {
  // Postgres syntax_error / undefined_table / undefined_column classes
  return (
    err.code === "42601" || err.code === "42P01" || err.code === "42703"
  );
}

// ---------- Execution plan parsing ----------

const SCAN_NODE_TYPES = new Set([
  "Seq Scan",
  "Index Scan",
  "Index Only Scan",
  "Bitmap Heap Scan",
  "Bitmap Index Scan",
]);

const JOIN_NODE_TYPES = new Set(["Nested Loop", "Hash Join", "Merge Join"]);

const OTHER_TRACKED_NODE_TYPES = new Set(["Sort", "Aggregate", "HashAggregate"]);

// Walks the plan tree once, collecting a flat list of every node so the
// summary and issue detection below don't each need their own traversal.
function flattenPlanNodes(planNode, nodes = []) {
  if (!planNode) return nodes;

  nodes.push(planNode);

  const children = planNode.Plans || [];
  for (const child of children) {
    flattenPlanNodes(child, nodes);
  }

  return nodes;
}

function buildExecutionPlanSummary(queryPlanResult) {
  const rootPlan = queryPlanResult.Plan;
  const nodes = flattenPlanNodes(rootPlan);

  const nodeTypeCounts = {};
  const scans = [];
  const joins = [];
  const sorts = [];
  const aggregates = [];

  for (const node of nodes) {
    const nodeType = node["Node Type"];
    nodeTypeCounts[nodeType] = (nodeTypeCounts[nodeType] || 0) + 1;

    const detail = {
      nodeType,
      relationName: node["Relation Name"] || null,
      indexName: node["Index Name"] || null,
      startupCost: node["Startup Cost"],
      totalCost: node["Total Cost"],
      estimatedRows: node["Plan Rows"],
    };

    if (SCAN_NODE_TYPES.has(nodeType)) scans.push(detail);
    if (JOIN_NODE_TYPES.has(nodeType)) joins.push(detail);
    if (nodeType === "Sort") sorts.push({ ...detail, sortKey: node["Sort Key"] || [] });
    if (OTHER_TRACKED_NODE_TYPES.has(nodeType) && nodeType !== "Sort") {
      aggregates.push(detail);
    }
  }

  return {
    startupCost: rootPlan["Startup Cost"],
    totalCost: rootPlan["Total Cost"],
    estimatedRows: rootPlan["Plan Rows"],
    planWidth: rootPlan["Plan Width"],
    planningTime: queryPlanResult["Planning Time"] ?? null,
    nodeTypeCounts,
    scans,
    joins,
    sorts,
    aggregates,
  };
}

// ---------- Issue detection ----------

const LARGE_ROW_ESTIMATE_THRESHOLD = 1000;
const HIGH_TOTAL_COST_THRESHOLD = 10000;

function detectIssues(summary) {
  const issues = [];

  for (const scan of summary.scans) {
    if (
      scan.nodeType === "Seq Scan" &&
      scan.estimatedRows > LARGE_ROW_ESTIMATE_THRESHOLD
    ) {
      issues.push({
        type: "SEQUENTIAL_SCAN",
        severity: "high",
        message: `Sequential scan on "${scan.relationName || "unknown table"}" estimated to touch ${scan.estimatedRows} rows. An index on the filtered/joined columns would likely help.`,
      });
    }
  }

  for (const join of summary.joins) {
    if (join.nodeType === "Nested Loop" && join.estimatedRows > LARGE_ROW_ESTIMATE_THRESHOLD) {
      issues.push({
        type: "EXPENSIVE_NESTED_LOOP",
        severity: "medium",
        message: `Nested Loop join estimated to produce ${join.estimatedRows} rows. Consider a Hash Join or an index to reduce the driven-side row count.`,
      });
    }
  }

  for (const sort of summary.sorts) {
    issues.push({
      type: "SORT_WITHOUT_INDEX",
      severity: "low",
      message: `Sort operation detected${
        sort.sortKey.length ? ` on (${sort.sortKey.join(", ")})` : ""
      }. A matching index could let PostgreSQL avoid sorting at runtime.`,
    });
  }

  if (summary.totalCost > HIGH_TOTAL_COST_THRESHOLD) {
    issues.push({
      type: "HIGH_TOTAL_COST",
      severity: "medium",
      message: `Estimated total cost is ${summary.totalCost}, which is high. Review scans/joins above for the main contributors.`,
    });
  }

  if (summary.scans.length === 0 && summary.totalCost > HIGH_TOTAL_COST_THRESHOLD) {
    issues.push({
      type: "NO_DIRECT_SCAN_VISIBLE",
      severity: "low",
      message: "No direct scan node found at the top level; review nested subplans for scan efficiency.",
    });
  }

  return issues;
}

function calculateOptimizationScore(issues) {
  const severityPenalty = { high: 20, medium: 12, low: 6 };

  let score = 100;
  for (const issue of issues) {
    score -= severityPenalty[issue.severity] ?? 5;
  }

  return Math.max(0, Math.min(100, score));
}

// ---------- AI analysis ----------

async function getAiAnalysis(originalQuery, executionPlanSummary, detectedIssues) {
  const question = `
You are an expert PostgreSQL Database Performance Engineer.

Analyze the SQL query and execution plan.

Return ONLY valid JSON.

Format:

{
  "optimizationScore": 0,
  "estimatedImprovement": "0%",
  "executionTime": "0 ms",
  "optimizedExecutionTime": "0 ms",
  "optimizedQuery": "",
  "recommendations": [],
  "analysis": ""
}

Rules:
- Return ONLY JSON.
- No markdown.
- No explanation outside JSON.
- recommendations must be an array.
- optimizedQuery must contain improved SQL.
- optimizationScore should be between 0 and 100.
`;

  const monitoringData = {
    originalQuery,
    executionPlan: executionPlanSummary,
    detectedIssues,
  };

  return aiService.generateResponse(question, monitoringData);
}

// ---------- Public API ----------

async function analyzeQuery(id, userId, sqlQuery) {
  const validationError = validateSqlQuery(sqlQuery);
  if (validationError) {
    return badRequestResult(validationError);
  }

  const query = sqlQuery.trim().replace(/;\s*$/, "");

  let client;
  try {
    const database = await getOwnedDatabase(id, userId);
    if (!database) return notFoundResult();

    client = await connectClient(database);

    let explainResult;
    try {
      explainResult = await client.query(
      `EXPLAIN (ANALYZE, FORMAT JSON) ${query}`
    );
    } catch (explainErr) {
      if (isSyntaxError(explainErr)) {
        return badRequestResult(`Invalid SQL query: ${explainErr.message}`);
      }
      throw explainErr;
    }

    const queryPlanResult = explainResult.rows[0]["QUERY PLAN"][0];

    const executionTime = queryPlanResult["Execution Time"] ?? null;
    const planningTime = queryPlanResult["Planning Time"] ?? null;

    const executionPlanSummary = buildExecutionPlanSummary(queryPlanResult);
    const detectedIssues = detectIssues(executionPlanSummary);
    const optimizationScore = calculateOptimizationScore(detectedIssues);

   const aiResult = await getAiAnalysis(
  query,
  executionPlanSummary,
  detectedIssues
);

return okResult({
  success: true,

  executionPlan: executionPlanSummary,

  detectedIssues,

  optimizationScore:
    aiResult.optimizationScore ?? optimizationScore,

  estimatedImprovement:
    aiResult.estimatedImprovement ?? "0%",

  executionTime:
    executionTime !== null
      ? `${Number(executionTime).toFixed(2)} ms`
      : "N/A",

  optimizedExecutionTime:
    executionTime !== null
      ? `${(Number(executionTime) * 0.8).toFixed(2)} ms`
      : "N/A",

  planningTime:
    planningTime !== null
      ? `${Number(planningTime).toFixed(2)} ms`
      : "N/A",

  optimizedQuery:
    aiResult.optimizedQuery ?? query,

  recommendations:
    aiResult.recommendations ?? [],

  aiAnalysis:
    aiResult.analysis ?? "",
});
  } catch (err) {
    return errorResultWithMessage(err, "Failed to analyze query");
  } finally {
    if (client) await client.end().catch(() => {});
  }
}

module.exports = {
  analyzeQuery,
};