"use client";

import { useEffect, useState } from "react";
import { Brain, ShieldCheck, AlertTriangle } from "lucide-react";
import { getPrediction } from "@/services/predictionService";

interface PredictionCardProps {
  databaseId: number;
  token: string;
}

interface PredictionData {
  riskLevel: string;
  probability: string;
  status: string;
  message: string;
  recommendations?: string[];
}

export default function PredictionCard({
  databaseId,
  token,
}: PredictionCardProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [database, setDatabase] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function loadPrediction() {
      try {
        setLoading(true);
        setError("");

        const response = await getPrediction(databaseId, token);

        setPrediction(response.prediction);
        setDatabase(response.database);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to load prediction.");
      } finally {
        setLoading(false);
      }
    }

    loadPrediction();
  }, [databaseId, token]);

  if (!token) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <p className="text-yellow-400">Waiting for authentication...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <p className="text-gray-300">Loading AI Prediction...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-red-500 rounded-2xl p-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <p className="text-red-400">Prediction data not found.</p>
      </div>
    );
  }

  const recommendations = prediction.recommendations ?? [];

  const badgeColor =
    prediction.riskLevel === "High"
      ? "bg-red-500/20 text-red-400"
      : prediction.riskLevel === "Medium"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-green-500/20 text-green-400";

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">

      <div className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Brain className="text-cyan-400 w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              AI Prediction
            </h2>

            <p className="text-gray-400 text-sm">
              {database}
            </p>
          </div>
        </div>

        <span className={`px-4 py-2 rounded-full font-semibold ${badgeColor}`}>
          {prediction.riskLevel}
        </span>

      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">

        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-gray-400 text-sm">
            Crash Probability
          </p>

          <h3 className="text-3xl font-bold text-white">
            {prediction.probability}
          </h3>
        </div>

        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-gray-400 text-sm">
            Status
          </p>

          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="text-green-400 w-5 h-5" />

            <span className="text-white font-semibold">
              {prediction.status}
            </span>
          </div>
        </div>

      </div>

      <div className="bg-slate-900 rounded-xl p-4 mb-5">

        <h3 className="text-lg font-semibold text-white mb-2">
          AI Analysis
        </h3>

        <p className="text-gray-300">
          {prediction.message}
        </p>

      </div>

      <div className="bg-slate-900 rounded-xl p-4">

        <h3 className="text-lg font-semibold text-white mb-3">
          Recommendations
        </h3>

        {recommendations.length === 0 ? (
          <p className="text-green-400">
            No recommendations required.
          </p>
        ) : (
          recommendations.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 mb-2"
            >
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-1" />

              <span className="text-gray-300">
                {item}
              </span>
            </div>
          ))
        )}

      </div>

    </div>
  );
}