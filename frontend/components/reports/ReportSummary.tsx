import { ReportResponse } from "@/types/report";
import ReportCard from "./ReportCard";

interface ReportSummaryProps {
  report: ReportResponse;
}

export default function ReportSummary({
  report,
}: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <ReportCard
        title="Database"
        value={report.report.database.name}
      />

      <ReportCard
        title="Version"
        value={report.report.database.version}
      />

      <ReportCard
        title="Database Size"
        value={report.report.database.size}
      />

      <ReportCard
        title="Active Connections"
        value={String(report.report.database.activeConnections)}
      />

    </div>
  );
}