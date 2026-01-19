// tools/commentAdder.js
import { handleAIRequest } from "../utils/ai.js";

export async function processCommentAdder(input, userModel, env = process.env, options = {}) {
  const {
    author = "Unknown",
    date = "",
    includeParamTags = false
  } = options;
  
  let docRequirements = "";

  console.log("CommentAdder payload:", {
    author,
    date,
    includeParamTags
  });


  if (author && author !== "Unknown") {
    docRequirements += `\n- Author: ${author}`;
  }

  if (date && (date !== "WithoutDate" && date !== "")) {
    docRequirements += `\n- Date: ${date}`;
  }

  if (includeParamTags) {
    docRequirements += `\n- Include technical tags (e.g., @param {type} name, @returns {type}) for all functions.`;
  }else{
    docRequirements += `\n- DO NOT Include technical tags (e.g., @param {type} name, @returns {type}) for all functions.`;
  }

  const SYSTEM_PROMPT = `
    You are a senior software engineer writing production-quality comments.

    TASK:
    Add concise, meaningful, useful comments to the code.

    RULES:
    - Add comments ABOVE Functions, Classes, and Complex blocks.
    - Do NOT comment obvious lines.
    - Use the language's native comment style (e.g., JSDoc for JS, Docstrings for Python).
    ${docRequirements}

    STRICT OUTPUT RULES:
    - Return ONLY the commented source code
    - No markdown code fences (no \`\`\`)
    - No explanations outside the code
  `;

  const apiKey = env.GROQ_API_KEY_2;
  return await handleAIRequest(apiKey, SYSTEM_PROMPT, input, userModel);
}