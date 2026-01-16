// tools/commentAdder.js
import { handleAIRequest } from "../utils/ai.js";

export async function processCommentAdder(input, userModel, env = process.env, options = {}) {
  const { author = "Unknown", date = "", includeParamTags = false } = options;
  
  // Logic for the date
  const finalDate = date || new Date().toISOString().split("T")[0];

  const SYSTEM_PROMPT = `
        You are a senior software engineer writing production-quality comments.

        TASK:
        Add concise, meaningful comments to the code.

        RULES:
        - Add comments ABOVE Functions, Classes, and Complex blocks.
        - Do NOT comment obvious lines.
        - Use the language's native comment style.
        - Each function comment must include:
          - Purpose (1 sentence)
          - Author: ${author}
          - Date: ${finalDate}
        ${includeParamTags ? "- Include technical tags (e.g., @param {type} name, @returns {type}) for all parameters and return values." : ""}

        STRICT OUTPUT RULES:
        - Return ONLY the commented source code
        - No markdown code fences
        - No explanations
        `;

  const apiKey = env.GROQ_API_KEY_2;
  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}