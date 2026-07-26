const API_URL = "http://localhost:5000/api/query-optimizer";

export async function optimizeQuery(
  databaseId: number,
  query: string,
  token: string
) {
  const response = await fetch(`${API_URL}/${databaseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to optimize query");
  }

  return data;
}