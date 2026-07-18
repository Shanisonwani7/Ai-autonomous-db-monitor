import { useEffect, useState } from "react";
import { getDashboard } from "../services/monitoring";

export function useMonitoring(databaseId: number | string, token: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const response = await getDashboard(databaseId, token);

        setData(response.database);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (databaseId && token) {
      loadDashboard();
    }
  }, [databaseId, token]);

  return {
    data,
    loading,
    error,
  };
}