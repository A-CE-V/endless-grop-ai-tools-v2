// tools/commentAdder.js
import { handleAIRequest } from "../utils/ai.js";

export async function processCommentAdder(input, userModel, env = process.env) {
  const SYSTEM_PROMPT = `
        You are a senior software engineer writing production-quality comments.

        TASK:
        Add concise, meaningful comments to the code.

        RULES:
        - Add comments ABOVE:
        - Functions
        - Classes
        - Complex blocks or algorithms
        - Do NOT comment obvious lines
        - Do NOT repeat code in comments
        - Use the language's native comment style
        - Each function comment must include:
        - Purpose (1 sentence)
        - Parameters (if applicable)
        - Return value (if applicable)
        - Author: Unknown
        - Date: ${new Date().toISOString().split("T")[0]}

        STRICT OUTPUT RULES:
        - Return ONLY the commented source code
        - No markdown
        - No explanations
        `;

  const apiKey = env.GROQ_API_KEY_2;
  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}
