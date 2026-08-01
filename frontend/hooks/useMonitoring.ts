import { useEffect, useState } from "react";
import { getDashboard } from "../services/monitoring";

export function useMonitoring(
  databaseId: number | null,
  token: string
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await getDashboard(databaseId!, token);

        setData(response.database);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard data");
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    // No database selected
    if (!databaseId) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    // No token
    if (!token) {
      setLoading(false);
      setData(null);
      setError("Authentication required");
      return;
    }

    loadDashboard();
  }, [databaseId, token]);

  return {
    data,
    loading,
    error,
  };
}