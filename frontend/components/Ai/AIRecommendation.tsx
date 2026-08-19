"use client";

import {
  Sparkles,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAIRecommendation } from "@/services/aiService";
import { useDatabase } from "@/context/DatabaseContext";

interface RecommendationData {
  confidence: number;
  suggestion: string;
  estimatedGain: string;
  recommendations: string[];
}

export default function AIRecommendation() {
  const { selectedDatabaseId } = useDatabase();

  const [data, setData] =
    useState<RecommendationData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const databaseId = Number(selectedDatabaseId);

    // No valid database selected
    if (!Number.isInteger(databaseId) || databaseId <= 0) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }

    async function loadRecommendation() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAIRecommendation(databaseId);

        setData({
          confidence: Number(response.confidence) || 0,

          suggestion:
            response.suggestion ||
            "Continue monitoring the database.",

          estimatedGain:
            response.estimatedGain || "N/A",

          recommendations:
            Array.isArray(response.recommendations)
              ? response.recommendations
              : [],
        });
      } catch (err) {
        console.error(
          "AI Recommendation Error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load AI recommendation"
        );

        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendation();
  }, [selectedDatabaseId]);

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <Loader2
            className="animate-spin"
            size={20}
          />
          Loading AI analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
        <p className="text-red-400 text-sm">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400">
          No AI recommendation available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">
              AI Analysis
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Real-time AI monitoring insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border bg-purple-500/10 text-purple-400 border-purple-500/20">
          Confidence: {data.confidence}%
        </div>
      </div>

      <div className="space-y-4 mb-8 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />

          <p className="text-gray-300">
            {data.suggestion}
          </p>
        </div>

        {data.recommendations.map(
          (recommendation, index) => (
            <div
              key={index}
              className="flex items-start gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />

              <p className="text-gray-300">
                {recommendation}
              </p>
            </div>
          )
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
          AI Suggestion
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-white font-medium">
            {data.suggestion}
          </p>

          <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
            <ArrowUpRight className="w-4 h-4" />

            <span className="font-bold text-sm">
              Estimated Gain: {data.estimatedGain}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}