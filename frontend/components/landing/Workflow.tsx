"use client";

import { motion } from "framer-motion";
import { Plug, Radar, BrainCircuit, TrendingUp, Wrench } from "lucide-react";

const STEPS = [
  { icon: Plug, title: "Connect Database", description: "Link your PostgreSQL instance in minutes, no schema changes required." },
  { icon: Radar, title: "Monitor", description: "Continuous, real-time visibility into performance and resource usage." },
  { icon: BrainCircuit, title: "Analyze", description: "AI models study patterns across metrics, queries, and logs." },
  { icon: TrendingUp, title: "Predict", description: "Emerging issues are forecasted before they impact your users." },
  { icon: Wrench, title: "Optimize", description: "Receive and apply ranked recommendations to keep performance high." },
];

export default function Workflow() {
  return (
    <section className="relative bg-[#020617] py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B5CF6]">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From connection to optimization
          </h2>
          <p className="mt-4 text-slate-400">
            A continuous loop that keeps your database healthy without manual
            intervention.
          </p>
        </motion.div>

        <div className="relative mt-20">
          <div
            aria-hidden
            className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-[#3B82F6] via-[#8B5CF6] to-transparent lg:left-0 lg:right-0 lg:top-6 lg:h-px lg:w-auto lg:bg-gradient-to-r"
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex gap-4 pl-16 lg:flex-col lg:items-center lg:gap-0 lg:pl-0 lg:text-center"
              >
                <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0F172A] shadow-[0_0_20px_rgba(59,130,246,0.25)] lg:static lg:mb-5">
                  <step.icon className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 lg:hidden">
                    Step {i + 1}
                  </p>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
