const axios = require("axios");
const { DATABASE_SYSTEM_PROMPT } = require("../prompts/databasePrompt");

class AIService {
  constructor() {
    this.systemPrompt = DATABASE_SYSTEM_PROMPT;

    this.baseURL = "https://openrouter.ai/api/v1/chat/completions";
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = "openai/gpt-4.1-mini";
    this.timeout = 30000;
    console.log("API Key Loaded:", !!this.apiKey);
    console.log("Model:", this.model);
  }

  buildPrompt(question, monitoringData) {
    return `
${this.systemPrompt}

Current Database Monitoring Data:

${JSON.stringify(monitoringData, null, 2)}

User Question:
${question}
`;
  }

  async generateResponse(question, monitoringData) {
    try {
      const prompt = this.buildPrompt(question, monitoringData);

      const response = await axios.post(
        this.baseURL,
       {
            model: this.model,
            messages: [
          {
          role: "system",
          content: this.systemPrompt,
          },
         {
         role: "user",
          content: prompt,
         },
        ],
        max_tokens: 250,
        temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "AI Autonomous Database Monitoring",
        },
          timeout: this.timeout,
        }
      );

      const content = response.data.choices[0].message.content;

try {
  return JSON.parse(content);
} catch (err) {
  return {
    optimizationScore: 80,
    estimatedImprovement: "0%",
    executionTime: "Unknown",
    optimizedExecutionTime: "Unknown",
    optimizedQuery: "",
    recommendations: [],
    analysis: content,
  };
}
    } catch (error) {
        console.log("========== OPENROUTER ERROR ==========");
        console.log("Status:", error.response?.status);
        console.log("Data:", JSON.stringify(error.response?.data, null, 2));
        console.log("Message:", error.message);
        console.log("======================================");

         throw new Error("Failed to generate AI response");
   }
  }
}

module.exports = new AIService();