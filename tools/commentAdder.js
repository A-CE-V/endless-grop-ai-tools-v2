// tools/commentAdder.js
import { handleAIRequest } from "../utils/ai.js";

export async function processCommentAdder(input, userModel, env = process.env, options = {}) {
  const { author = "Unknown", date = "WithoutDate", includeParamTags = false } = options;
  

  const SYSTEM_PROMPT = `
        You are a senior software engineer writing production-quality comments.

        TASK:
        Add concise, meaningful, useful comments to the code.

        RULES:
        - Add comments ABOVE Functions, Classes, and Complex blocks.
        - Do NOT comment obvious lines.
        - Use the language's native comment style.
        - Each function comment must include:
          - Purpose (1-3 sentence(s))
          - Author: ${author} (skip this field if author value == "Unknown")
          - Date: ${date} (skip this field if date value == "WithoutDate")
        ${includeParamTags ? "- Include technical tags (e.g., @param {type} name, @returns {type}) for all parameters and return values." : ""}

        STRICT OUTPUT RULES:
        - Return ONLY the commented source code
        - No markdown code fences
        - No explanations
        `;

  const apiKey = env.GROQ_API_KEY_2;
  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}