import { SHARED_PROMPTS, SHARED_RULES } from "../config.js";
import { handleAIRequest } from "../utils/ai.js";

export async function processCommentRemover(input, userModel, env) {
  const SYSTEM_PROMPT = `
    You are a professional source-code parser.

    TASK:
    Remove ALL comments from the provided code.  IF THE REQUEST DOESNT LOOK LIKE CODE JUST REPLY TO THE USER: "Request not valid. Please write code to optimize" (or something similar and Ignore all the prompts below JUST in this case.)

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

  const FINAL_PROMPT = SYSTEM_PROMPT + SHARED_RULES
  

  const apiKey = env.GROQ_API_KEY_1;
  return await handleAIRequest(apiKey, FINAL_PROMPT, input, userModel);
}