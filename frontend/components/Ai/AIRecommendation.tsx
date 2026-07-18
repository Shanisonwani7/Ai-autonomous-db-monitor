"use client";

import { Sparkles, ArrowUpRight } from "lucide-react";

interface AIRecommendationProps {
  data: {
    healthScore: number;
    cacheHitRatio: number;
    deadlocks: number;
    activeConnections: number;
  } | null;
}

export default function AIRecommendation({ data }: AIRecommendationProps) {
  if (!data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full min-h-[300px] flex items-center justify-center hover:border-cyan-500/30 transition">
        <p className="text-gray-400 animate-pulse font-medium">Loading AI recommendations...</p>
      </div>
    );
  }

  // AI Confidence Logic
  let aiConfidence = "82%";
  if (data.healthScore >= 90) {
    aiConfidence = "96%";
  } else if (data.healthScore >= 80) {
    aiConfidence = "90%";
  }

  // AI Suggestion Logic
  let suggestion = "Database is running efficiently. Continue monitoring.";
  let estimatedGain = "+5%";

  if (data.cacheHitRatio < 90) {
    suggestion = "Increase shared_buffers for better performance.";
    estimatedGain = "+20%";
  } else if (data.deadlocks > 0) {
    suggestion = "Optimize transactions and add indexes.";
    estimatedGain = "+30%";
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Analysis</h3>
            <p className="text-sm text-gray-400 mt-1">Real-time optimization insights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border bg-purple-500/10 text-purple-400 border-purple-500/20">
          Confidence: {aiConfidence}
        </div>
      </div>

      <div className="space-y-4 mb-8 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
          <p className="text-gray-300">
            {data.healthScore >= 90 ? "✅ Database health is excellent." : "⚠ Database health needs improvement."}
          </p>
        </div>

        {data.cacheHitRatio < 90 && (
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
            <p className="text-gray-300">Increase cache/shared_buffers to improve cache hit ratio.</p>
          </div>
        )}

        {data.deadlocks > 0 && (
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
            <p className="text-gray-300">Deadlocks detected. Investigate long-running transactions.</p>
          </div>
        )}

        {data.activeConnections > 80 && (
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></div>
            <p className="text-gray-300">High active connections detected. Consider connection pooling.</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Suggestion</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-white font-medium">{suggestion}</p>
          <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-bold text-sm">Estimated Gain: {estimatedGain}</span>
          </div>
        </div>
      </div>
    </div>
  );
}