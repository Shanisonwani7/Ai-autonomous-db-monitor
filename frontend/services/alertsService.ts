const API_URL = "http://localhost:5000/api/alerts";

export interface AlertItem {
  id: number;
  databaseId: number;
  type: string;
  severity: string;
  status: string;
  message: string;
  metric?: string | null;
  threshold?: number | null;
  actualValue?: number | null;
  anomalyScore?: number | null;
  riskLevel?: string | null;
  probability?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AlertsResponse {
  success: boolean;
  database?: string;
  totalAlerts?: number;
  alerts: AlertItem[];
  message?: string;
}

// Get current active alerts
export async function getAlerts(
  databaseId: number,
  token: string
): Promise<AlertsResponse> {
  const response = await fetch(`${API_URL}/${databaseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch alerts"
    );
  }

  return data;
}

// Get alert history
export async function getAlertHistory(
  databaseId: number,
  token: string,
  limit = 50
): Promise<AlertsResponse> {
  const response = await fetch(
    `${API_URL}/${databaseId}/history?limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch alert history"
    );
  }

  return data;
}

// Resolve an alert
export async function resolveAlert(
  alertId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/${alertId}/resolve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to resolve alert"
    );
  }

  return data;
}