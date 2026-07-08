const reportService = require("../services/reportService");
const pdfService = require("../services/pdfService");

exports.generateReport = async (req, res) => {
  try {
    const databaseId = Number(req.params.id);

    if (!databaseId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const result = await reportService.generateReport(
      databaseId,
      req.user.id
    );

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate report",
    });
  }
};
exports.downloadPDF = async (req, res) => {
  try {
    const databaseId = Number(req.params.id);

    if (!databaseId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Database ID",
      });
    }

    const result = await reportService.generateReport(
      databaseId,
      req.user.id
    );

    if (result.statusCode !== 200) {
      return res.status(result.statusCode).json(result.body);
    }

    const pdfBuffer = await pdfService.generatePDF(result.body.report);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=database-report-${databaseId}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate PDF report",
    });
  }
};