"use client";

import { useEffect, useState } from "react";

interface Anomaly {
  metric: string;
  severity: string;
  message: string;
  current: number;
  average: number;
}

interface AnomalyData {
  status: string;
  anomalyScore: number;
  riskLevel: string;
  anomalies: Anomaly[];
}

interface Props {
  databaseId: number;
}

export default function AnomalyDetection({
  databaseId,
}: Props) {
  const [data, setData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnomaly() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/anomaly/${databaseId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to detect anomalies"
          );
        }

        setData(result.anomaly);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to detect anomalies"
        );
      } finally {
        setLoading(false);
      }
    }

    if (databaseId) {
      loadAnomaly();
    }
  }, [databaseId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-sm text-gray-400">
          Analyzing database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900 bg-gray-900 p-5">
        <p className="text-sm text-red-400">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Anomaly Detection
          </h2>

          <p className="text-sm text-gray-400">
            AI analysis of recent database activity
          </p>
        </div>

        <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
          {data.riskLevel} Risk
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-800 p-4">
          <p className="text-xs text-gray-400">
            Anomaly Score
          </p>

          <p className="mt-1 text-2xl font-semibold text-white">
            {data.anomalyScore}
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-4">
          <p className="text-xs text-gray-400">
            Status
          </p>

          <p className="mt-1 text-2xl font-semibold text-white">
            {data.status}
          </p>
        </div>
      </div>

      {data.anomalies.length === 0 ? (
        <div className="rounded-lg border border-green-900 bg-green-950/30 p-4">
          <p className="font-medium text-green-400">
            No anomalies detected
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Recent database activity is within the normal range.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.anomalies.map((anomaly, index) => (
            <div
              key={`${anomaly.metric}-${index}`}
              className="rounded-lg border border-gray-800 bg-gray-950 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">
                  {anomaly.metric}
                </p>

                <span className="text-xs text-gray-400">
                  {anomaly.severity}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                {anomaly.message}
              </p>

              <div className="mt-3 flex gap-5 text-xs text-gray-500">
                <span>
                  Current: {anomaly.current}
                </span>

                <span>
                  Average: {anomaly.average}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}