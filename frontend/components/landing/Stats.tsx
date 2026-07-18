"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Activity, ShieldCheck, Cpu, Sparkles } from "lucide-react";

interface Stat {
  icon: typeof Activity;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  tone: string;
}

const STATS: Stat[] = [
  { icon: Activity, value: 99.9, suffix: "%", decimals: 1, label: "Uptime", tone: "#3B82F6" },
  { icon: Cpu, value: 24, suffix: "/7", label: "Monitoring", tone: "#8B5CF6" },
  { icon: Sparkles, value: 100, suffix: "%", label: "AI Powered", tone: "#22C55E" },
  { icon: ShieldCheck, value: 100, suffix: "%", label: "Enterprise Security", tone: "#F59E0B" },
];

function Counter({ value, decimals = 0, suffix }: { value: number; decimals?: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#020617] py-16">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-80 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/10 blur-[140px]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4.5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 text-center backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20"
              style={{
                boxShadow: "0 0 0 rgba(0,0,0,0)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(120px circle at 50% 0%, ${stat.tone}33, transparent 70%)`,
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
                style={{ backgroundColor: stat.tone }}
              />

              <div
                className="relative mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${stat.tone}33, ${stat.tone}11)`,
                }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.tone }} />
              </div>
              <div className="relative text-2xl font-bold text-white sm:text-3xl">
                <Counter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </div>
              <p className="relative mt-1.5 text-xs font-medium text-slate-400 sm:text-sm">
                {stat.label}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
