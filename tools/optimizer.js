import { handleAIRequest } from "../utils/ai.js";
import { SHARED_PROMPTS, SHARED_RULES } from "../config.js";

export async function processOptimizer(input, userModel, env) {
  const SYSTEM_PROMPT = `
        You are a senior performance-focused software engineer.

        TASK:
        Optimize the provided code. IF THE REQUEST DOESNT LOOK LIKE CODE JUST REPLY TO THE USER: "Request not valid. Please write code to optimize" (or something similar and Ignore all the prompts below JUST in this case.)

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

  const FINAL_PROMPT = SYSTEM_PROMPT + SHARED_RULES;


  // Explicitly use Key 3
  const apiKey = env.GROQ_API_KEY_3;

  return await handleAIRequest(apiKey, FINAL_PROMPT, input, userModel);
}