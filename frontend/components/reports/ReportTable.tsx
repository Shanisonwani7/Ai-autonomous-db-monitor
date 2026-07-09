import { ReportResponse } from "@/types/report";

interface ReportTableProps {
  report: ReportResponse;
}

export default function ReportTable({
  report,
}: ReportTableProps) {
  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

      <div className="px-6 py-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">
          Monitoring Summary
        </h2>
      </div>

      <table className="w-full text-left">
        <tbody>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Running Queries</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.monitoring.runningQueries}
            </td>
          </tr>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Slow Queries</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.monitoring.slowQueries}
            </td>
          </tr>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Idle Sessions</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.monitoring.idleSessions}
            </td>
          </tr>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Long Transactions</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.monitoring.longTransactions}
            </td>
          </tr>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Locks</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.monitoring.locks}
            </td>
          </tr>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Commits</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.statistics.commits}
            </td>
          </tr>

          <tr className="border-b border-slate-800">
            <td className="px-6 py-4 text-slate-400">Rollbacks</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.statistics.rollbacks}
            </td>
          </tr>

          <tr>
            <td className="px-6 py-4 text-slate-400">Deadlocks</td>
            <td className="px-6 py-4 text-white font-medium">
              {report.report.statistics.deadlocks}
            </td>
          </tr>

        </tbody>
      </table>

    </div>
  );
}