"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  AlertCircle,
  Settings,
  Search,
  Bell,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Wifi,
  Server,
  Gauge,
} from "lucide-react";

interface SidebarItem {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
}

interface UsageCard {
  icon: typeof Cpu;
  label: string;
  value: string;
  tone: string;
  bar: number;
  trend: string;
}

interface AlertRow {
  level: "Warning" | "Info" | "Success";
  tone: string;
  text: string;
  database: string;
  time: string;
}

interface StatusCard {
  icon: typeof Server;
  label: string;
  value: string;
  tone: string;
  status: "Healthy" | "Warning";
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Database, label: "Databases", active: false },
  { icon: Activity, label: "Insights", active: false },
  { icon: AlertCircle, label: "Alerts", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const USAGE_CARDS: UsageCard[] = [
  { icon: Cpu, label: "CPU Usage", value: "42%", tone: "#3B82F6", bar: 42, trend: "+3.2%" },
  { icon: MemoryStick, label: "RAM Usage", value: "68%", tone: "#8B5CF6", bar: 68, trend: "+1.4%" },
  { icon: HardDrive, label: "Disk Usage", value: "51%", tone: "#F59E0B", bar: 51, trend: "+0.6%" },
  { icon: Users, label: "Active Connections", value: "184", tone: "#22C55E", bar: 61, trend: "+12" },
];

const RECENT_ALERTS: AlertRow[] = [
  { level: "Warning", tone: "#F59E0B", text: "Query latency spike detected", database: "orders_db", time: "2m ago" },
  { level: "Info", tone: "#3B82F6", text: "Index suggestion generated for users.email", database: "auth_db", time: "14m ago" },
  { level: "Success", tone: "#22C55E", text: "Autovacuum completed successfully", database: "inventory_db", time: "38m ago" },
  { level: "Warning", tone: "#F59E0B", text: "Connection pool nearing threshold", database: "analytics_db", time: "51m ago" },
];

const STATUS_CARDS: StatusCard[] = [
  { icon: Wifi, label: "Replication", value: "In sync", tone: "#22C55E", status: "Healthy" },
  { icon: Server, label: "Primary Node", value: "Online", tone: "#22C55E", status: "Healthy" },
  { icon: Gauge, label: "Query Latency", value: "48ms avg", tone: "#F59E0B", status: "Warning" },
];

const QUERY_PERFORMANCE = [22, 34, 28, 44, 38, 52, 46, 60, 54, 68, 61, 72];
const DATABASE_SIZE = [18, 22, 21, 27, 30, 29, 35, 38, 41, 44, 42, 49];

function buildPath(points: number[], width: number, height: number) {
  const max = Math.max(...points);
  const step = width / (points.length - 1);
  const line = points
    .map((point, i) => {
      const x = i * step;
      const y = height - (point / max) * height;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

function StatusChip({ status }: { status: "Healthy" | "Warning" }) {
  const isHealthy = status === "Healthy";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isHealthy
          ? "bg-[#22C55E]/15 text-[#22C55E]"
          : "bg-[#F59E0B]/15 text-[#F59E0B]"
      }`}
    >
      {isHealthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {status}
    </span>
  );
}

export default function DashboardPreview() {
  const chartWidth = 480;
  const chartHeight = 120;
  const queryPath = buildPath(QUERY_PERFORMANCE, chartWidth, chartHeight);
  const sizePath = buildPath(DATABASE_SIZE, chartWidth, chartHeight);

  return (
    <section id="dashboard-preview" className="relative bg-[#020617] py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B5CF6]">
            Live Dashboard
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Every metric, one command center
          </h2>
          <p className="mt-4 text-slate-400">
            A preview of the workspace your team will monitor and act from
            every day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative mt-16"
        >
          <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-r from-[#3B82F6]/15 to-[#8B5CF6]/15 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-xl">
            <div className="flex">
              {/* Left Sidebar */}
              <aside className="hidden w-56 shrink-0 border-r border-white/5 bg-[#111827]/60 p-4 lg:block">
                <div className="mb-6 flex items-center gap-2 px-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
                    <Database className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="text-sm font-semibold text-slate-100">AI DB Monitor</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {SIDEBAR_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                        item.active
                          ? "bg-[#3B82F6]/15 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  ))}
                </nav>

                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
                    </span>
                    <span className="text-xs font-medium text-slate-300">
                      production-postgres-01
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">Connected database</p>
                </div>
              </aside>

              {/* Main */}
              <div className="min-w-0 flex-1">
                {/* Top navbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-500">
                    <Search className="h-3.5 w-3.5" />
                    Search databases...
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                      <Clock className="h-3.5 w-3.5" />
                      Last updated: just now
                    </span>
                    <Bell className="h-4 w-4 text-slate-400" />
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]" />
                  </div>
                </div>

                <div className="p-5">
                  {/* Connected database badge */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <Database className="h-3.5 w-3.5 text-[#3B82F6]" />
                      <span className="text-xs font-medium text-slate-300">
                        production-postgres-01
                      </span>
                      <StatusChip status="Healthy" />
                    </div>
                    <span className="text-xs text-slate-500 sm:hidden">
                      Last updated: just now
                    </span>
                  </div>

                  {/* Usage cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {USAGE_CARDS.map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3B82F6]/40 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: `${card.tone}22` }}
                          >
                            <card.icon className="h-4 w-4" style={{ color: card.tone }} />
                          </span>
                          <span className="text-lg font-bold text-white">{card.value}</span>
                        </div>
                        <p className="mt-2.5 text-xs text-slate-400">{card.label}</p>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${card.bar}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: card.tone }}
                          />
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">
                          <span style={{ color: card.tone }}>{card.trend}</span> vs last hour
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Query performance chart */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-white/20 lg:col-span-2">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">
                          Query Performance (24h)
                        </p>
                        <StatusChip status="Healthy" />
                      </div>
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="w-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="queryFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={queryPath.area} fill="url(#queryFill)" />
                        <path d={queryPath.line} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
                      </svg>
                    </div>

                    {/* Health score gauge */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center transition-colors duration-300 hover:border-white/20">
                      <p className="text-sm font-medium text-slate-300">
                        Database Health Score
                      </p>
                      <div className="relative mt-3 flex h-24 w-24 items-center justify-center">
                        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                          <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#22C55E"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.91) }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          />
                        </svg>
                        <span className="absolute text-xl font-bold text-white">91</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Excellent condition</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Database size chart */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-white/20 lg:col-span-2">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">Database Size Growth</p>
                        <span className="text-xs text-slate-500">GB, last 12 weeks</span>
                      </div>
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="w-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="sizeFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={sizePath.area} fill="url(#sizeFill)" />
                        <path d={sizePath.line} fill="none" stroke="#8B5CF6" strokeWidth="2.5" />
                      </svg>
                    </div>

                    {/* AI Recommendation panel */}
                    <div className="rounded-xl border border-[#3B82F6]/25 bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 p-5 transition-colors duration-300 hover:border-[#3B82F6]/40">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#3B82F6]" />
                        <p className="text-sm font-medium text-slate-200">AI Recommendation</p>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Add an index on <span className="text-slate-200">users.email</span> to
                        reduce full table scans.
                      </p>
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#22C55E]/10 px-3 py-2">
                        <Activity className="h-3.5 w-3.5 text-[#22C55E]" />
                        <span className="text-xs font-medium text-[#22C55E]">
                          Estimated gain: +62%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System status cards */}
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {STATUS_CARDS.map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${card.tone}22` }}
                          >
                            <card.icon className="h-4 w-4" style={{ color: card.tone }} />
                          </span>
                          <div>
                            <p className="text-xs text-slate-500">{card.label}</p>
                            <p className="text-sm font-medium text-slate-200">{card.value}</p>
                          </div>
                        </div>
                        <StatusChip status={card.status} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent alerts table */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="mb-3 text-sm font-medium text-slate-300">Recent Alerts</p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                            <th className="pb-2 pr-4 font-medium">Severity</th>
                            <th className="pb-2 pr-4 font-medium">Message</th>
                            <th className="pb-2 pr-4 font-medium">Database</th>
                            <th className="pb-2 font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {RECENT_ALERTS.map((alert) => (
                            <tr
                              key={alert.text}
                              className="border-b border-white/5 last:border-0 transition-colors duration-200 hover:bg-white/[0.03]"
                            >
                              <td className="py-2.5 pr-4">
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                                  style={{ backgroundColor: `${alert.tone}22`, color: alert.tone }}
                                >
                                  {alert.level === "Warning" && <AlertTriangle className="h-3 w-3" />}
                                  {alert.level === "Info" && <Info className="h-3 w-3" />}
                                  {alert.level === "Success" && <CheckCircle2 className="h-3 w-3" />}
                                  {alert.level}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 text-slate-300">{alert.text}</td>
                              <td className="py-2.5 pr-4 text-slate-500">{alert.database}</td>
                              <td className="py-2.5 text-slate-500">{alert.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
