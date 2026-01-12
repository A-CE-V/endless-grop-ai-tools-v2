import { handleAIRequest } from "../utils/ai.js";

export async function processDetector(input, userModel, env) {
  const SYSTEM_PROMPT = `
    You are an AI content detection engine.

    TASK:
    Analyze the text and estimate whether it was AI-generated.

    OUTPUT FORMAT (STRICT):
    {
    "ai_probability": number (0–100),
    "confidence": "low" | "medium" | "high",
    "reasoning": "brief explanation"
    }

    RULES:
    - Return ONLY valid JSON
    - No markdown
    - No additional text
    `;


  // Explicitly use Key 4
  const apiKey = env.GROQ_API_KEY_4;

  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}