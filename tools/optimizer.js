import { handleAIRequest } from "../utils/ai";

export async function processOptimizer(input, userModel, env) {
  const SYSTEM_PROMPT = `
        You are a senior performance-focused software engineer.

        TASK:
        Optimize the provided code.

        OPTIMIZE FOR:
        - Performance
        - Readability
        - Maintainability
        - Security best practices

        STRICT RULES:
        - Preserve functionality exactly
        - Preserve public APIs
        - Do NOT introduce breaking changes
        - Do NOT add comments or explanations
        - Do NOT add logging
        - Do NOT use experimental syntax

        OUTPUT:
        Return ONLY the optimized source code.
        `;


  // Explicitly use Key 3
  const apiKey = env.GROQ_API_KEY_3;

  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}