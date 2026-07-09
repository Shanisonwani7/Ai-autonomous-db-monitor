import { ReportResponse } from "@/types/report";

const API_URL = "http://localhost:5000/api/reports";

function getToken() {
  return localStorage.getItem("token");
}

export async function getReport(databaseId: number): Promise<ReportResponse> {
  const response = await fetch(`${API_URL}/${databaseId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch report");
  }

  return data;
}

export async function downloadReport(databaseId: number) {
  const response = await fetch(`${API_URL}/${databaseId}/pdf`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `database-report-${databaseId}.pdf`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}