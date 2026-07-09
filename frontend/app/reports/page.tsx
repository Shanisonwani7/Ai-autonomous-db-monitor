"use client";

import { useEffect, useState } from "react";
import { getReport } from "@/services/reportService";
import { ReportResponse } from "@/types/report";
import DownloadButton from "@/components/reports/DownloadButton";
import ReportSummary from "@/components/reports/ReportSummary";
import ReportTable from "@/components/reports/ReportTable";

export default function ReportsPage() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        // Abhi database id = 2
        const data = await getReport(2);

        setReport(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading Report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-4xl font-bold mb-2">
        Database Report
      </h1>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 
      <div>
            <p className="text-slate-400">
              Real-time monitoring report generated from your PostgreSQL database.
           </p>

           <p className="text-sm text-slate-500 mt-2">
                Generated:
             {" "}
             {new Date(report.generatedAt).toLocaleString()}
            </p>
        </div>

           <DownloadButton databaseId={2} />

        </div>

          <ReportSummary report={report} />

        <div className="mt-8">
           <ReportTable report={report} />
        </div>

    </div>
  );
}