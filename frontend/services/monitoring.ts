const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getDashboard(
  databaseId: number | string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/monitor/dashboard/${databaseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

export async function getStatistics(
  databaseId: number | string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/monitor/statistics/${databaseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch statistics");
  }

  return response.json();
}

export async function getSummary(
  databaseId: number | string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/monitor/summary/${databaseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monitoring summary");
  }

  return response.json();
}

// Get Historical Monitoring Data
export async function getMonitoringHistory(
  databaseId: number | string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/monitor/history/${databaseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch monitoring history");
  }

  return response.json();
}