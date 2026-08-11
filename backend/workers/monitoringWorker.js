const prisma = require("../config/prisma");
const monitoringService = require("../services/monitoringService");

const INTERVAL_MS = 5 * 60 * 1000;

let workerInterval = null;
let isRunning = false;

async function collectAllDatabases() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const databases = await prisma.database.findMany({
  where: {
    status: "Connected",
  },
});
console.log("[MonitoringWorker] Databases found:", databases.length);
    for (const database of databases) {
      try {
        const result =
          await monitoringService.collectHistoricalMetrics(database);
          console.log(
  "[MonitoringWorker] Collection result:",
  result
);
        if (!result.success) {
          console.error(
            `[MonitoringWorker] Database ${database.id} failed:`,
            result.errorMessage
          );
        }
      } catch (error) {
        console.error(
          `[MonitoringWorker] Database ${database.id} error:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "[MonitoringWorker] Failed to collect databases:",
      error.message
    );
  } finally {
    isRunning = false;
  }
}

function startMonitoringWorker() {
  if (workerInterval) {
    return;
  }

  console.log("[MonitoringWorker] Started");

  collectAllDatabases();

  workerInterval = setInterval(
    collectAllDatabases,
    INTERVAL_MS
  );
}

function stopMonitoringWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }

  console.log("[MonitoringWorker] Stopped");
}

module.exports = {
  startMonitoringWorker,
  stopMonitoringWorker,
};