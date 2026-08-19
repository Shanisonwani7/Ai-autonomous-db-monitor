const {
  getOwnedDatabase,
} = require("./monitoringService");

const { PrismaClient } = require("@prisma/client");

const {
  predictDatabaseFailure,
} = require("./pythonAIService");

const prisma = new PrismaClient();

function okResult(body) {
  return {
    statusCode: 200,
    body,
  };
}

function notFoundResult() {
  return {
    statusCode: 404,
    body: {
      success: false,
      message: "Database Not Found",
    },
  };
}

async function predictDatabaseFailureService(
  databaseId,
  userId
) {
  try {
    // Verify database ownership
    const database = await getOwnedDatabase(
      databaseId,
      userId
    );

    if (!database) {
      return notFoundResult();
    }

    /*
     * Get REAL historical monitoring records.
     * Newest record comes first.
     */
    const history = await prisma.monitoringMetric.findMany({
      where: {
        databaseId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 50,
      select: {
        activeConnections: true,
        runningQueries: true,
        slowQueries: true,
        deadlocks: true,
        locks: true,
        longTransactions: true,
        healthScore: true,
        databaseSize: true,
      },
    });

    /*
     * Python service needs historical data
     * to calculate the prediction.
     */
    const predictionResult =
      await predictDatabaseFailure(
        database.name,
        history
      );

    /*
     * Return the Python AI Service result
     * directly to the existing frontend contract.
     */
    return okResult({
      success: true,
      database: database.name,
      prediction:
        predictionResult.prediction,
      analysis:
        predictionResult.analysis,
    });
  } catch (error) {
    console.error(
      "========== PREDICTION SERVICE ERROR =========="
    );
    console.error(error);
    console.error(
      "=============================================="
    );

    return {
      statusCode: 500,
      body: {
        success: false,
        message: "Prediction Failed",
        error: error.message,
      },
    };
  }
}

module.exports = {
  predictDatabaseFailureService,
};