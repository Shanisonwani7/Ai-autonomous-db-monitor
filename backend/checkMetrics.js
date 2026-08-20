const prisma = require("./config/prisma");

async function main() {
  const databases = [12, 14, 16];

  for (const databaseId of databases) {
    const metrics = await prisma.monitoringMetric.findMany({
      where: {
        databaseId,
        healthScore: {
          not: null,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
      select: {
        timestamp: true,
        activeConnections: true,
        cacheHitRatio: true,
        runningQueries: true,
        slowQueries: true,
        locks: true,
        longTransactions: true,
        deadlocks: true,
        healthScore: true,
      },
    });

    console.log(
      `\n========== DATABASE ${databaseId} ==========`
    );

    console.log(
      "Usable ML records:",
      metrics.length
    );

    if (metrics.length === 0) {
      continue;
    }

    const healthScores = metrics
      .map((m) => m.healthScore)
      .filter((v) => v !== null);

    const cacheRatios = metrics
      .map((m) => m.cacheHitRatio)
      .filter((v) => v !== null);

    const connections = metrics.map(
      (m) => m.activeConnections
    );

    const locks = metrics.map(
      (m) => m.locks
    );

    console.log(
      "Health range:",
      Math.min(...healthScores),
      "→",
      Math.max(...healthScores)
    );

    if (cacheRatios.length > 0) {
      console.log(
        "Cache hit range:",
        Math.min(...cacheRatios),
        "→",
        Math.max(...cacheRatios)
      );
    }

    console.log(
      "Connections range:",
      Math.min(...connections),
      "→",
      Math.max(...connections)
    );

    console.log(
      "Locks range:",
      Math.min(...locks),
      "→",
      Math.max(...locks)
    );

    console.log(
      "First usable record:",
      metrics[0]
    );

    console.log(
      "Last usable record:",
      metrics[metrics.length - 1]
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());