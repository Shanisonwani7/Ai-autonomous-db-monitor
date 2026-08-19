const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = `${BASE_URL.replace(/\/+$/, "")}/api/ai`;

function getToken(): string {
  return localStorage.getItem("token") || "";
}

export async function askAI(
  question: string,
  databaseId: number
): Promise<string> {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        databaseId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to get AI response"
    );
  }

  if (typeof data.answer === "string") {
    return data.answer;
  }

  if (data.answer?.analysis) {
    return data.answer.analysis;
  }

  return "No response received from AI.";
}

export async function getAIRecommendation(
  databaseId: number
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/recommendation/${databaseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to get AI recommendation"
    );
  }

  return data;
}