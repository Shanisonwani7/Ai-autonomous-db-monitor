"use client";

import { motion } from "framer-motion";
import {
  HeartPulse,
  Radar,
  AlertTriangle,
  Gauge,
  Lightbulb,
  BarChart3,
  FileText,
  BellRing,
} from "lucide-react";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "AI Health Score",
    description:
      "A single, continuously updated score that reflects the overall wellbeing of every monitored database.",
  },
  {
    icon: Radar,
    title: "Real-Time Monitoring",
    description:
      "Live visibility into CPU, memory, disk, and connections with sub-second metric refresh rates.",
  },
  {
    icon: AlertTriangle,
    title: "Predictive Failure Detection",
    description:
      "Machine learning models flag degrading trends before they turn into downtime or data loss.",
  },
  {
    icon: Gauge,
    title: "Query Optimization",
    description:
      "Automatic detection of slow queries with concrete, ranked suggestions to speed them up.",
  },
  {
    icon: Lightbulb,
    title: "AI Recommendations",
    description:
      "Actionable, prioritized guidance for indexing, schema design, and configuration tuning.",
  },
  {
    icon: BarChart3,
    title: "Database Analytics",
    description:
      "Deep historical trends across performance, storage, and query patterns in one dashboard.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    description:
      "Scheduled health and performance reports delivered straight to your team, no manual work.",
  },
  {
    icon: BellRing,
    title: "Smart Alerts",
    description:
      "Context-aware alerts that suppress noise and escalate only what genuinely needs attention.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-[#020617] py-28">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
            Platform Capabilities
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything your database needs, watched by AI
          </h2>
          <p className="mt-4 text-slate-400">
            A complete toolkit for keeping PostgreSQL fast, healthy, and
            predictable &mdash; without the manual effort.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/50 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#3B82F6]/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/25 to-[#8B5CF6]/25 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-5 w-5 text-[#60A5FA]" strokeWidth={2} />
              </div>
              <h3 className="relative text-[15px] font-semibold text-white">
                {feature.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
