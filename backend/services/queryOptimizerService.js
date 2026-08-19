const {
  getOwnedDatabase,
  connectClient,
} = require("./monitoringService");

const { chatWithAI } = require("./pythonAIService");

// ---------- Result helpers ----------

function notFoundResult(message = "Database Not Found") {
  return {
    statusCode: 404,
    body: {
      success: false,
      message,
    },
  };
}

function badRequestResult(message) {
  return {
    statusCode: 400,
    body: {
      success: false,
      message,
    },
  };
}

function okResult(body) {
  return {
    statusCode: 200,
    body,
  };
}

function errorResultWithMessage(err, publicMessage) {
  console.error("========== QUERY OPTIMIZER ERROR ==========");
  console.error(err);
  console.error("============================================");

  return {
    statusCode: 500,
    body: {
      success: false,
      message: publicMessage,
      error: err.message,
    },
  };
}

// ---------- SQL validation ----------

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

  // Remove trailing semicolon
  const withoutTrailingSemicolon = query.replace(/;\s*$/, "");

  // Reject stacked statements
  if (withoutTrailingSemicolon.includes(";")) {
    return "Only a single SQL statement is allowed";
  }

  /*
   * Query Optimizer is intentionally read-only.
   *
   * We allow:
   * SELECT ...
   * WITH ...
   *
   * We reject write/destructive statements such as:
   * INSERT / UPDATE / DELETE / DROP / ALTER / TRUNCATE
   */
  const firstKeyword = withoutTrailingSemicolon
    .replace(
      /^\s*(?:--.*\n|\/\*[\s\S]*?\*\/\s*)*/g,
      ""
    )
    .trim()
    .split(/\s+/)[0]
    .toUpperCase();

  if (firstKeyword !== "SELECT" && firstKeyword !== "WITH") {
    return "Only SELECT or WITH queries can be analyzed";
  }

  return null;
}

function isSyntaxError(err) {
  return (
    err.code === "42601" ||
    err.code === "42P01" ||
    err.code === "42703"
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

const JOIN_NODE_TYPES = new Set([
  "Nested Loop",
  "Hash Join",
  "Merge Join",
]);

const OTHER_TRACKED_NODE_TYPES = new Set([
  "Sort",
  "Aggregate",
  "HashAggregate",
]);

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

  if (!rootPlan) {
    throw new Error("Execution plan did not contain a root Plan");
  }

  const nodes = flattenPlanNodes(rootPlan);

  const nodeTypeCounts = {};
  const scans = [];
  const joins = [];
  const sorts = [];
  const aggregates = [];

  for (const node of nodes) {
    const nodeType = node["Node Type"];

    nodeTypeCounts[nodeType] =
      (nodeTypeCounts[nodeType] || 0) + 1;

    const detail = {
      nodeType,
      relationName: node["Relation Name"] || null,
      indexName: node["Index Name"] || null,
      startupCost: node["Startup Cost"],
      totalCost: node["Total Cost"],
      estimatedRows: node["Plan Rows"],
    };

    if (SCAN_NODE_TYPES.has(nodeType)) {
      scans.push(detail);
    }

    if (JOIN_NODE_TYPES.has(nodeType)) {
      joins.push(detail);
    }

    if (nodeType === "Sort") {
      sorts.push({
        ...detail,
        sortKey: node["Sort Key"] || [],
      });
    }

    if (
      OTHER_TRACKED_NODE_TYPES.has(nodeType) &&
      nodeType !== "Sort"
    ) {
      aggregates.push(detail);
    }
  }

  return {
    startupCost: rootPlan["Startup Cost"],
    totalCost: rootPlan["Total Cost"],
    estimatedRows: rootPlan["Plan Rows"],
    planWidth: rootPlan["Plan Width"],
    planningTime:
      queryPlanResult["Planning Time"] ?? null,
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
      Number(scan.estimatedRows || 0) >
        LARGE_ROW_ESTIMATE_THRESHOLD
    ) {
      issues.push({
        type: "SEQUENTIAL_SCAN",
        severity: "high",
        message:
          `Sequential scan on "${scan.relationName || "unknown table"}" ` +
          `is estimated to touch ${scan.estimatedRows} rows. ` +
          `Review indexes and filtering conditions.`,
      });
    }
  }

  for (const join of summary.joins) {
    if (
      join.nodeType === "Nested Loop" &&
      Number(join.estimatedRows || 0) >
        LARGE_ROW_ESTIMATE_THRESHOLD
    ) {
      issues.push({
        type: "EXPENSIVE_NESTED_LOOP",
        severity: "medium",
        message:
          `Nested Loop join is estimated to produce ` +
          `${join.estimatedRows} rows. Review join conditions ` +
          `and indexes on the involved tables.`,
      });
    }
  }

  for (const sort of summary.sorts) {
    issues.push({
      type: "SORT_OPERATION",
      severity: "low",
      message:
        `Sort operation detected${
          sort.sortKey.length
            ? ` on (${sort.sortKey.join(", ")})`
            : ""
        }. Review whether an appropriate existing index could help.`,
    });
  }

  if (
    Number(summary.totalCost || 0) >
    HIGH_TOTAL_COST_THRESHOLD
  ) {
    issues.push({
      type: "HIGH_TOTAL_COST",
      severity: "medium",
      message:
        `Estimated total plan cost is ${summary.totalCost}, ` +
        `which is relatively high. Review the major scans and joins.`,
    });
  }

  if (
    summary.scans.length === 0 &&
    Number(summary.totalCost || 0) >
      HIGH_TOTAL_COST_THRESHOLD
  ) {
    issues.push({
      type: "NO_DIRECT_SCAN_VISIBLE",
      severity: "low",
      message:
        "No direct scan node was found at the top level. " +
        "Review nested subplans for scan efficiency.",
    });
  }

  return issues;
}

function calculateOptimizationScore(issues) {
  const severityPenalty = {
    high: 20,
    medium: 12,
    low: 6,
  };

  let score = 100;

  for (const issue of issues) {
    score -= severityPenalty[issue.severity] ?? 5;
  }

  return Math.max(0, Math.min(100, score));
}

// ---------- AI response parsing ----------

function extractJsonFromAiAnswer(answer) {
  if (typeof answer !== "string") {
    return null;
  }

  const trimmed = answer.trim();

  // Direct JSON
  try {
    return JSON.parse(trimmed);
  } catch {}

  // JSON inside markdown code fence
  const fencedMatch = trimmed.match(
    /```(?:json)?\s*([\s\S]*?)\s*```/i
  );

  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {}
  }

  return null;
}

function normalizeAiResult(aiAnswer, originalQuery) {
  const parsed = extractJsonFromAiAnswer(aiAnswer);

  if (!parsed || typeof parsed !== "object") {
    return {
      optimizationScore: null,
      estimatedImprovement: "N/A",
      executionTime: "N/A",
      optimizedExecutionTime: "N/A",
      optimizedQuery: originalQuery,
      recommendations: [],
      analysis:
        typeof aiAnswer === "string"
          ? aiAnswer
          : "AI analysis was unavailable.",
    };
  }

  const score = Number(parsed.optimizationScore);

  const safeScore =
    Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : null;

  const recommendations = Array.isArray(
    parsed.recommendations
  )
    ? parsed.recommendations.filter(
        (item) => typeof item === "string"
      )
    : [];

  return {
    optimizationScore: safeScore,
    estimatedImprovement:
      typeof parsed.estimatedImprovement === "string"
        ? parsed.estimatedImprovement
        : "N/A",

    executionTime:
      typeof parsed.executionTime === "string"
        ? parsed.executionTime
        : "N/A",

    optimizedExecutionTime:
      typeof parsed.optimizedExecutionTime === "string"
        ? parsed.optimizedExecutionTime
        : "N/A",

    optimizedQuery:
      typeof parsed.optimizedQuery === "string" &&
      parsed.optimizedQuery.trim()
        ? parsed.optimizedQuery
        : originalQuery,

    recommendations,

    analysis:
      typeof parsed.analysis === "string"
        ? parsed.analysis
        : "No AI performance analysis available.",
  };
}

// ---------- AI analysis ----------

async function getAiAnalysis(
  originalQuery,
  executionPlanSummary,
  detectedIssues
) {
  const question = `
You are an expert PostgreSQL Database Performance Engineer.

Analyze the original SQL query, PostgreSQL execution plan,
and detected performance issues.

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "optimizationScore": 0,
  "estimatedImprovement": "0%",
  "executionTime": "N/A",
  "optimizedExecutionTime": "N/A",
  "optimizedQuery": "ORIGINAL QUERY",
  "recommendations": [],
  "analysis": ""
}

Rules:

- optimizationScore must be between 0 and 100.
- estimatedImprovement must be a percentage string or "N/A".
- executionTime must be "N/A" because this service uses EXPLAIN without ANALYZE.
- optimizedExecutionTime must be "N/A" unless you can safely provide a clearly labeled estimate.
- optimizedQuery must be executable PostgreSQL SQL.
- Preserve the meaning of the original query.
- Never invent tables.
- Never invent columns.
- Never invent values.
- Never invent indexes.
- Never add fake WHERE conditions.
- Never add fake JOIN conditions.
- Never add imaginary filters.
- Never add placeholders.
- If a safe optimization cannot be determined, return the original query unchanged.
- recommendations must contain only actionable observations supported by the execution plan.
- analysis must be concise.
`;

  const monitoringData = {
    originalQuery,
    executionPlan: executionPlanSummary,
    detectedIssues,
  };

  const response = await chatWithAI(
    question,
    monitoringData
  );

  return normalizeAiResult(
    response?.answer,
    originalQuery
  );
}

// ---------- Public API ----------

async function analyzeQuery(id, userId, sqlQuery) {
  const validationError = validateSqlQuery(
    sqlQuery
  );

  if (validationError) {
    return badRequestResult(validationError);
  }

  const query = sqlQuery
    .trim()
    .replace(/;\s*$/, "");

  let client;

  try {
    const database = await getOwnedDatabase(
      id,
      userId
    );

    if (!database) {
      return notFoundResult();
    }

    client = await connectClient(database);

    let explainResult;

    try {
      /*
       * IMPORTANT:
       *
       * Do NOT use EXPLAIN ANALYZE here.
       * EXPLAIN ANALYZE executes the supplied query.
       *
       * FORMAT JSON gives us the PostgreSQL planner output
       * without executing the underlying SELECT/WITH statement.
       */
      explainResult = await client.query(
        `EXPLAIN (FORMAT JSON) ${query}`
      );
    } catch (explainErr) {
      if (isSyntaxError(explainErr)) {
        return badRequestResult(
          `Invalid SQL query: ${explainErr.message}`
        );
      }

      throw explainErr;
    }

    const queryPlanResult =
      explainResult?.rows?.[0]?.["QUERY PLAN"]?.[0];

    if (!queryPlanResult) {
      throw new Error(
        "PostgreSQL did not return a valid execution plan"
      );
    }

    const executionPlanSummary =
      buildExecutionPlanSummary(
        queryPlanResult
      );

    const detectedIssues =
      detectIssues(executionPlanSummary);

    const calculatedScore =
      calculateOptimizationScore(
        detectedIssues
      );

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
        aiResult.optimizationScore ??
        calculatedScore,

      estimatedImprovement:
        aiResult.estimatedImprovement,

      /*
       * Since ANALYZE is intentionally not used,
       * there is no actual execution time available.
       */
      executionTime:
        aiResult.executionTime,

      optimizedExecutionTime:
        aiResult.optimizedExecutionTime,

      planningTime:
        executionPlanSummary.planningTime !== null
          ? `${Number(
              executionPlanSummary.planningTime
            ).toFixed(2)} ms`
          : "N/A",

      optimizedQuery:
        aiResult.optimizedQuery || query,

      recommendations:
        aiResult.recommendations,

      aiAnalysis:
        aiResult.analysis,
    });
  } catch (err) {
    return errorResultWithMessage(
      err,
      "Failed to analyze query"
    );
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
}

module.exports = {
  analyzeQuery,
};