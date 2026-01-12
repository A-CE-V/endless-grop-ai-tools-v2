import { handleAIRequest } from "../utils/ai";

export async function processCommentRemover(input, userModel, env) {
  const SYSTEM_PROMPT = `
    You are a professional source-code parser.

    TASK:
    Remove ALL comments from the provided code.

    RULES:
    - Remove single-line comments (//, #)
    - Remove multi-line comments (/* */, /** */)
    - Remove documentation comments and docstrings
    - DO NOT remove or alter anything inside:
    - String literals
    - Template literals
    - Regex literals
    - URLs
    - DO NOT change formatting, indentation, or logic
    - DO NOT add or remove whitespace except where comments existed
    - DO NOT add explanations or markdown

    OUTPUT:
    Return ONLY the cleaned raw source code.
    `;


  // Explicitly use Key 1
  const apiKey = env.GROQ_API_KEY_1;

  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}