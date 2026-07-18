"use client";

import { motion } from "framer-motion";
import { Bot, User, TrendingUp, Sparkles } from "lucide-react";

export default function AISection() {
  return (
    <section className="relative bg-[#020617] py-28">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6]/10 blur-[160px]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ask your database anything, get instant answers
          </h2>
          <p className="mt-4 text-slate-400">
            The AI DB Monitor assistant reads your live metrics and query
            history in real time, translating complex performance data into
            clear, plain-language answers &mdash; then hands you the fix.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/15">
                <TrendingUp className="h-4 w-4 text-[#3B82F6]" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Root-cause analysis</p>
                <p className="text-sm text-slate-400">
                  Correlates CPU load, lock contention, and query plans to
                  pinpoint exactly what is slowing your database down.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
                <Bot className="h-4 w-4 text-[#8B5CF6]" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Actionable fixes</p>
                <p className="text-sm text-slate-400">
                  Every answer ships with a concrete, ranked recommendation
                  and its estimated performance impact, so your team knows
                  exactly what to do next.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-[#3B82F6]/15 to-[#8B5CF6]/15 blur-2xl" />
          <div className="rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
                <Bot className="h-3.5 w-3.5 text-white" />
              </span>
              <p className="text-sm font-medium text-slate-200">AI DB Monitor Assistant</p>
              <span className="ml-auto h-2 w-2 rounded-full bg-[#22C55E]" />
            </div>

            <div className="flex flex-col gap-4 p-5">
              <div className="flex justify-end gap-2.5">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#3B82F6]/20 px-4 py-2.5 text-sm text-slate-100">
                  Why is my database slow?
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <User className="h-3.5 w-3.5 text-slate-300" />
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex gap-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="max-w-[85%] space-y-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <p>
                    <span className="text-[#F59E0B]">High CPU usage detected</span>{" "}
                    on your primary instance over the last hour.
                  </p>
                  <p>
                    <span className="text-[#EF4444]">Missing index</span> on{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-200">
                      users.email
                    </code>{" "}
                    is causing repeated full table scans.
                  </p>
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-[#22C55E]/10 px-3 py-2">
                    <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
                    <span className="text-xs font-medium text-[#22C55E]">
                      Estimated improvement: 62%
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
