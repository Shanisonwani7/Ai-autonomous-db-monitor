"use client";

import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { ReportResponse } from "@/types/report";

interface ReportTableProps {
  report: ReportResponse;
}

export default function ReportTable({ report }: ReportTableProps) {
  const { statistics } = report.report;

  const rows = [
    {
      label: "Commits",
      value: statistics.commits,
      icon: CheckCircle2,
      tone: "bg-emerald-500/10 text-emerald-400",
      description: "Successfully committed transactions",
    },
    {
      label: "Rollbacks",
      value: statistics.rollbacks,
      icon: XCircle,
      tone:
        statistics.rollbacks > 0
          ? "bg-amber-500/10 text-amber-400"
          : "bg-slate-800 text-slate-300",
      description: "Transactions rolled back",
    },
    {
      label: "Deadlocks",
      value: statistics.deadlocks,
      icon: ShieldAlert,
      tone:
        statistics.deadlocks > 0
          ? "bg-red-500/10 text-red-400"
          : "bg-slate-800 text-slate-300",
      description: "Deadlocks detected",
    },
  ] as const;

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Statistics
      </h2>
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Metric
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <tr
                  key={row.label}
                  className="border-b border-slate-800/60 transition-colors last:border-b-0 hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${row.tone}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-white">{row.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">
                    {row.description}
                  </td>
                  <td className="px-5 py-4 text-right text-lg font-semibold text-white">
                    {row.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}