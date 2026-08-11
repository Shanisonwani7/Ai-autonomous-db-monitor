-- CreateTable
CREATE TABLE "MonitoringMetric" (
    "id" SERIAL NOT NULL,
    "databaseId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeConnections" INTEGER NOT NULL DEFAULT 0,
    "databaseSize" TEXT,
    "cacheHitRatio" DOUBLE PRECISION,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "rollbacks" INTEGER NOT NULL DEFAULT 0,
    "deadlocks" INTEGER NOT NULL DEFAULT 0,
    "runningQueries" INTEGER NOT NULL DEFAULT 0,
    "slowQueries" INTEGER NOT NULL DEFAULT 0,
    "locks" INTEGER NOT NULL DEFAULT 0,
    "longTransactions" INTEGER NOT NULL DEFAULT 0,
    "idleSessions" INTEGER NOT NULL DEFAULT 0,
    "healthScore" INTEGER,

    CONSTRAINT "MonitoringMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoringMetric_databaseId_timestamp_idx" ON "MonitoringMetric"("databaseId", "timestamp");

-- AddForeignKey
ALTER TABLE "MonitoringMetric" ADD CONSTRAINT "MonitoringMetric_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "Database"("id") ON DELETE CASCADE ON UPDATE CASCADE;
