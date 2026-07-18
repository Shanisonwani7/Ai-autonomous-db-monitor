"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "How does the AI monitor my PostgreSQL database?",
    answer:
      "AI DB Monitor connects securely to your database and continuously streams performance metrics, query plans, and system stats to its analysis engine, which detects anomalies and trends in real time.",
  },
  {
    question: "Will this platform slow down my production database?",
    answer:
      "No. Monitoring is designed to be lightweight, using read-only connections and sampling techniques so the overhead on your production workload stays negligible.",
  },
  {
    question: "How accurate are the failure predictions?",
    answer:
      "Predictions are generated from models trained on historical performance patterns across many databases, and every recommendation includes a confidence level so your team can prioritize accordingly.",
  },
  {
    question: "Can I apply optimizations automatically?",
    answer:
      "You stay in control. Recommendations are surfaced with full context and estimated impact, and you choose whether to apply them manually or approve automated execution.",
  },
  {
    question: "Is my database credentials and data kept secure?",
    answer:
      "Yes. Credentials are encrypted at rest, connections use least-privilege access, and query data is processed under strict isolation so it is never shared across accounts.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-[#020617] py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
            Questions
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="mt-12 flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-slate-100 sm:text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 shrink-0 text-slate-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#3B82F6]" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
