"use client";

import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  Activity,
  Timer,
  Zap,
  Target,
  Code2,
  Lightbulb,
  ArrowRight,
  Database,
  CheckCircle2,
} from "lucide-react";

import { optimizeQuery } from "@/services/queryOptimizer";
import { useDatabase } from "@/context/DatabaseContext";

interface QueryResult {
  optimizationScore?: number;
  estimatedImprovement?: string;
  executionTime?: string;
  optimizedExecutionTime?: string;
  optimizedQuery?: string;
  recommendations?: string[];
  aiAnalysis?: string;
  analysis?: string;
  detectedIssues?: unknown[];
}

export default function QueryOptimizer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);

  const { selectedDatabaseId } = useDatabase();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || ""
      : "";

  const handleAnalyze = async () => {
    if (!query.trim()) {
      alert("Please enter a SQL query.");
      return;
    }

    if (!selectedDatabaseId) {
      alert("Please select a database.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setResult(null);

      const response = await optimizeQuery(
        selectedDatabaseId,
        query.trim(),
        token
      );

      console.log("AI QUERY OPTIMIZER RESPONSE:", response);

      setResult(response);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to analyze query."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const recommendations = result?.recommendations ?? [];

  const optimizedQuery =
    result?.optimizedQuery ?? "";

  const aiAnalysis =
    result?.aiAnalysis ??
    result?.analysis ??
    "";

  const score =
    typeof result?.optimizationScore === "number"
      ? `${result.optimizationScore}/100`
      : "—";

  const estimatedImprovement =
    result?.estimatedImprovement ?? "—";

  const executionTime =
    result?.executionTime ?? "—";

  const optimizedExecutionTime =
    result?.optimizedExecutionTime ?? "—";

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-[#0B0F19] text-gray-100 p-6 md:p-8 lg:p-12">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl border border-white/5">
              <Database className="w-8 h-8 text-blue-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200">
              AI Query Optimizer
            </h1>
          </div>

          <p className="text-gray-400 text-lg max-w-2xl pl-14">
            Analyze SQL queries and receive optimization suggestions powered by AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 space-y-6"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />

              <div className="relative bg-[#131B2C] border border-white/10 rounded-2xl p-4 overflow-hidden flex flex-col h-[400px]">
                <div className="flex items-center space-x-2 mb-3 px-2">
                  <Code2 className="w-5 h-5 text-purple-400" />

                  <span className="text-sm font-medium text-gray-300">
                    Input Query
                  </span>
                </div>

                <textarea
                  className="flex-1 w-full bg-transparent text-gray-200 placeholder-gray-600 resize-none outline-none font-mono text-sm leading-relaxed custom-scrollbar p-2"
                  placeholder="Paste your SQL query here..."
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />

              <div className="relative flex items-center justify-center space-x-2">
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze Query</span>
                  </>
                )}
              </div>
            </motion.button>
          </motion.div>

          {/* Results */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-7 space-y-6"
          >
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Query Score",
                  value: score,
                  icon: Target,
                  color: "text-green-400",
                },
                {
                  label: "Est. Improvement",
                  value: estimatedImprovement,
                  icon: Activity,
                  color: "text-blue-400",
                },
                {
                  label: "Execution Time",
                  value: executionTime,
                  icon: Timer,
                  color: "text-orange-400",
                },
                {
                  label: "Optimized Time",
                  value: optimizedExecutionTime,
                  icon: Zap,
                  color: "text-purple-400",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-[#131B2C] border border-white/5 p-4 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-xl"
                >
                  <stat.icon
                    className={`w-6 h-6 mb-3 ${stat.color}`}
                  />

                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>

                  <p className="text-2xl font-bold text-gray-100">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Performance Comparison */}
            <div className="bg-[#131B2C] border border-white/5 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                Performance Comparison
              </h3>

              {!result ? (
                <div className="text-sm text-gray-500">
                  Analyze a query to see performance comparison.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Original Query
                      </span>

                      <span className="text-gray-300 font-mono">
                        100%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 1,
                          delay: 0.2,
                        }}
                        className="h-full bg-gray-600 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">
                        Optimized Query
                      </span>

                      <span className="text-purple-400 font-mono font-medium">
                        {result.executionTime !== "N/A" &&
                        result.optimizedExecutionTime !== "N/A"
                          ? "Estimated"
                          : "Analysis"}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            result.estimatedImprovement &&
                            result.estimatedImprovement.endsWith(
                              "%"
                            )
                              ? `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    100 -
                                      Number(
                                        result.estimatedImprovement.replace(
                                          "%",
                                          ""
                                        )
                                      )
                                  )
                                )}%`
                              : "100%",
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.4,
                        }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optimized Query */}
            <div className="bg-[#131B2C] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[#1C2438] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />

                  <span className="text-sm font-medium text-gray-200">
                    Optimized Query
                  </span>
                </div>

                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                </div>
              </div>

              <div className="p-4 bg-[#0D121D] min-h-[120px]">
                {optimizedQuery ? (
                  <pre className="font-mono text-sm leading-relaxed overflow-x-auto text-blue-300">
                    <code>{optimizedQuery}</code>
                  </pre>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Analyze a query to see the optimized SQL.
                  </p>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center mb-4">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                AI Suggestions
              </h3>

              {!result ? (
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-sm text-gray-500">
                  Analyze a query to receive AI recommendations.
                </div>
              ) : recommendations.length === 0 ? (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-sm text-emerald-300">
                  No recommendations for this query.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map(
                    (suggestion, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                        }}
                        className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 p-4 rounded-xl flex items-start space-x-3 transition-all"
                      >
                        <div className="mt-0.5 bg-purple-500/20 p-1.5 rounded-lg text-purple-400">
                          <ArrowRight className="w-4 h-4" />
                        </div>

                        <p className="text-sm text-gray-300 leading-relaxed">
                          {suggestion}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              )}

              {/* AI Analysis */}
              <div className="bg-[#131B2C] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                  AI Performance Analysis
                </h3>

                <p className="text-gray-300 leading-7 whitespace-pre-line">
                  {aiAnalysis ||
                    "Analyze a query to see AI insights."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}