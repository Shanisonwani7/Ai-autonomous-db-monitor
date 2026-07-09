// AI Service

const API_URL = "http://localhost:5000/api/ai";

// Get JWT Token
function getToken() {
  return localStorage.getItem("token");
}

// Ask AI
export async function askAI(question: string, databaseId: number) {
  const token = getToken();

  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question,
      databaseId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get AI response");
  }

  return data.answer;
}