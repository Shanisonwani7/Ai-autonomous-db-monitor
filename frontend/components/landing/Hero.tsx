"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles, Terminal } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#020617] pt-16"
    >
      {/* Animated grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,black_10%,transparent_75%)]"
      />

      {/* Blur blobs */}
      <div
        aria-hidden
        className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-[#3B82F6]/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -right-24 top-64 h-[28rem] w-[28rem] rounded-full bg-[#8B5CF6]/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#22C55E]/10 blur-[130px]"
      />

      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" />
          Autonomous, AI-driven database intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          AI-Powered Autonomous
          <br />
          <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#8B5CF6] bg-clip-text text-transparent">
            Database Monitoring Platform
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-base text-slate-400 sm:text-lg"
        >
          Monitor, Analyze, Predict and Optimize PostgreSQL Databases using
          Artificial Intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_35px_rgba(59,130,246,0.4)] transition-transform duration-200 hover:scale-[1.03]"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#dashboard-preview"
            onClick={(event) => {
              event.preventDefault();
              document
                .getElementById("dashboard-preview")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
          >
            View Live Dashboard
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="relative mt-20 w-full max-w-3xl"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 blur-2xl" />
          <div className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5 text-left font-mono text-xs text-slate-400 shadow-2xl backdrop-blur-xl sm:text-sm">
            <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
              <Terminal className="h-3.5 w-3.5 text-[#22C55E]" />
              <span className="text-slate-500">ai-db-monitor &mdash; live agent</span>
            </div>
            <p>
              <span className="text-[#22C55E]">✓</span> Connected to{" "}
              <span className="text-slate-200">production-postgres-01</span>
            </p>
            <p className="mt-1.5">
              <span className="text-[#F59E0B]">⚠</span> Anomaly detected: query
              latency +42% on <span className="text-slate-200">orders</span>
            </p>
            <p className="mt-1.5">
              <span className="text-[#3B82F6]">→</span> AI recommendation ready
              &mdash; estimated gain{" "}
              <span className="text-[#22C55E]">+61% throughput</span>
            </p>
            <p className="mt-1.5 flex items-center" aria-hidden="true">
              <span className="text-slate-600">$</span>
              <motion.span
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                className="ml-1.5 inline-block h-3.5 w-1.5 bg-[#3B82F6]"
              />
            </p>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#features"
        aria-label="Scroll to features section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 rounded-sm text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] sm:flex"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </motion.span>
      </motion.a>

      {/* Floating accents */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-1/3 hidden h-3 w-3 rounded-full bg-[#3B82F6] shadow-[0_0_16px_4px_rgba(59,130,246,0.6)] lg:block"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-[10%] top-1/4 hidden h-2.5 w-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_16px_4px_rgba(139,92,246,0.6)] lg:block"
      />
    </section>
  );
}
