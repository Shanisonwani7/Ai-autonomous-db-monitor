"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#020617] py-28">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[30rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#3B82F6]/25 to-[#8B5CF6]/25 blur-[130px]"
      />
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 backdrop-blur-xl sm:px-16"
        >
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Monitor Your Database Smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Connect your first PostgreSQL instance in minutes and let the AI
            handle the watching.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_35px_rgba(59,130,246,0.4)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
