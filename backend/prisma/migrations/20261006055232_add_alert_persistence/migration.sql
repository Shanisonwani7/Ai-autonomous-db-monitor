-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "databaseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metric" TEXT,
    "threshold" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "anomalyScore" DOUBLE PRECISION,
    "riskLevel" TEXT,
    "probability" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_databaseId_createdAt_idx" ON "Alert"("databaseId", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_databaseId_status_idx" ON "Alert"("databaseId", "status");

-- CreateIndex
CREATE INDEX "Alert_databaseId_type_idx" ON "Alert"("databaseId", "type");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "Database"("id") ON DELETE CASCADE ON UPDATE CASCADE;
