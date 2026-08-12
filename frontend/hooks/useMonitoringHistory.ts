import { useEffect, useState } from "react";
import { getMonitoringHistory } from "../services/monitoring";

export function useMonitoringHistory(
  databaseId: number | null,
  token: string
) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);

        const response = await getMonitoringHistory(databaseId!, token);

        setHistory(response.data || []);
      } catch (err: any) {
        setError(
          err.message || "Failed to fetch monitoring history"
        );
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    if (!databaseId) {
      setHistory([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!token) {
      setHistory([]);
      setLoading(false);
      setError("Authentication required");
      return;
    }

    loadHistory();
  }, [databaseId, token]);

  return {
    history,
    loading,
    error,
  };
}