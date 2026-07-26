const API_URL = "http://localhost:5000/api/alerts";

export async function getAlerts(
  databaseId: number,
  token: string
) {
  const response = await fetch(`${API_URL}/${databaseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch alerts");
  }

  return data;
}