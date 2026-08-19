const PDFDocument = require("pdfkit");

function generatePDF(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));

      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      // ==========================
      // Calculate report status
      // ==========================
      const runningQueries = Number(
        report.monitoring.runningQueries ?? 0
      );

      const slowQueries = Number(
        report.monitoring.slowQueries ?? 0
      );

      const idleSessions = Number(
        report.monitoring.idleSessions ?? 0
      );

      const longTransactions = Number(
        report.monitoring.longTransactions ?? 0
      );

      const locks = Number(
        report.monitoring.locks ?? 0
      );

      const deadlocks = Number(
        report.statistics.deadlocks ?? 0
      );

      /*
       * Locks alone do not mean the database is unhealthy.
       *
       * Critical:
       * - deadlocks >= 5
       * - locks >= 20
       * - long transactions >= 5
       * - running queries >= 50
       *
       * Warning:
       * - slow queries >= 5
       * - long transactions > 0
       * - deadlocks > 0
       * - locks >= 15 and running queries > 0
       */
      const isCritical =
        deadlocks >= 5 ||
        locks >= 20 ||
        longTransactions >= 5 ||
        runningQueries >= 50;

      const isWarning =
        !isCritical &&
        (
          slowQueries >= 5 ||
          longTransactions > 0 ||
          deadlocks > 0 ||
          (locks >= 15 && runningQueries > 0)
        );

      let healthStatus = "Healthy";

      if (isCritical) {
        healthStatus = "Critical";
      } else if (isWarning) {
        healthStatus = "Needs Attention";
      }

      // ==========================
      // Title
      // ==========================
      doc
        .fontSize(22)
        .text(
          "AI Autonomous Database Monitoring Report",
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(10)
        .text(
          `Generated At: ${new Date().toLocaleString()}`
        );

      doc.moveDown();

      // ==========================
      // Overall Status
      // ==========================
      doc
        .fontSize(16)
        .text("Overall Status", {
          underline: true,
        });

      doc.moveDown(0.5);

      doc
        .fontSize(14)
        .text(`Database Status: ${healthStatus}`);

      doc.moveDown();

      // ==========================
      // Database Information
      // ==========================
      doc
        .fontSize(16)
        .text("Database Information", {
          underline: true,
        });

      doc.moveDown(0.5);

      doc.fontSize(12);

      doc.text(
        `Database Name: ${report.database.name}`
      );

      doc.text(
        `Version: ${report.database.version}`
      );

      doc.text(
        `Database Size: ${report.database.size}`
      );

      doc.text(
        `Active Connections: ${report.database.activeConnections}`
      );

      doc.moveDown();

      // ==========================
      // Monitoring
      // ==========================
      doc
        .fontSize(16)
        .text("Monitoring Summary", {
          underline: true,
        });

      doc.moveDown(0.5);

      doc.fontSize(12);

      doc.text(
        `Running Queries: ${runningQueries}`
      );

      doc.text(
        `Slow Queries: ${slowQueries}`
      );

      doc.text(
        `Idle Sessions: ${idleSessions}`
      );

      doc.text(
        `Long Transactions: ${longTransactions}`
      );

      doc.text(
        `Locks: ${locks}`
      );

      doc.moveDown();

      // ==========================
      // Statistics
      // ==========================
      doc
        .fontSize(16)
        .text("Database Statistics", {
          underline: true,
        });

      doc.moveDown(0.5);

      doc.fontSize(12);

      doc.text(
        `Commits: ${report.statistics.commits}`
      );

      doc.text(
        `Rollbacks: ${report.statistics.rollbacks}`
      );

      doc.text(
        `Deadlocks: ${deadlocks}`
      );

      doc.moveDown();

      // ==========================
      // AI Recommendation
      // ==========================
      doc
        .fontSize(16)
        .text("AI Recommendation", {
          underline: true,
        });

      doc.moveDown(0.5);

      doc.fontSize(12);

      if (healthStatus === "Healthy") {
        doc.text(
          "Database is healthy based on the current monitoring metrics. Continue regular monitoring."
        );
      } else if (healthStatus === "Needs Attention") {
        doc.text(
          "Some monitoring indicators require attention. Review slow queries, transactions, locks, and deadlock activity."
        );
      } else {
        doc.text(
          "Critical database conditions were detected. Immediate investigation and maintenance are recommended."
        );
      }

      doc.moveDown(2);

      // ==========================
      // Footer
      // ==========================
      doc
        .fontSize(10)
        .fillColor("gray")
        .text(
          "Generated by AI Autonomous Database Monitoring Platform",
          {
            align: "center",
          }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generatePDF,
};