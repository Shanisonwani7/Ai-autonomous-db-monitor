"use client";

import {
  Activity,
  AlertTriangle,
  Clock,
  Database,
  HardDrive,
  Lock,
  Server,
  Timer,
  Users,
} from "lucide-react";
import ReportCard, { CardTone } from "@/components/reports/ReportCard";
import { ReportResponse } from "@/types/report";

interface ReportSummaryProps {
  report: ReportResponse;
}

function toneForCount(value: number, warnAt: number, critAt: number): CardTone {
  if (value >= critAt) return "critical";
  if (value >= warnAt) return "warning";
  return "good";
}

export default function ReportSummary({ report }: ReportSummaryProps) {
  const { database, monitoring } = report.report;

  return (
    <div className="space-y-8">
      {/* Database Overview */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Database Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportCard icon={Database} label="Database" value={database.name} tone="info" />
          <ReportCard icon={Server} label="Version" value={database.version} tone="neutral" />
          <ReportCard icon={HardDrive} label="Size" value={database.size} tone="neutral" />
          <ReportCard
            icon={Users}
            label="Active Connections"
            value={database.activeConnections}
            tone="info"
          />
        </div>
      </section>

      {/* Monitoring */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Monitoring
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ReportCard
            icon={Activity}
            label="Running Queries"
            value={monitoring.runningQueries}
            tone={toneForCount(monitoring.runningQueries, 20, 50)}
          />
          <ReportCard
            icon={Clock}
            label="Idle Sessions"
            value={monitoring.idleSessions}
            tone={toneForCount(monitoring.idleSessions, 20, 50)}
          />
          <ReportCard
            icon={AlertTriangle}
            label="Slow Queries"
            value={monitoring.slowQueries}
            tone={toneForCount(monitoring.slowQueries, 1, 5)}
            hint={monitoring.slowQueries > 0 ? "Attention" : "OK"}
          />
          <ReportCard
            icon={Timer}
            label="Long Transactions"
            value={monitoring.longTransactions}
            tone={toneForCount(monitoring.longTransactions, 1, 5)}
            hint={monitoring.longTransactions > 0 ? "Attention" : "OK"}
          />
          <ReportCard
            icon={Lock}
            label="Locks"
            value={monitoring.locks}
            tone={toneForCount(monitoring.locks, 1, 3)}
            hint={monitoring.locks > 0 ? "Attention" : "OK"}
          />
        </div>
      </section>
    </div>
  );
}