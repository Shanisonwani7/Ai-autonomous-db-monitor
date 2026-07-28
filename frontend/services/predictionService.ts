const API_URL = "http://localhost:5000/api/prediction";

export async function getPrediction(
  databaseId: number,
  token: string
) {
  const response = await fetch(`${API_URL}/${databaseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch prediction");
  }

  return data;
}