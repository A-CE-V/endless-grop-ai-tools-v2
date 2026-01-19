// tools/commentAdder.js
import { SHARED_PROMPTS } from "../config.js";
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

    /*
  if (author && author !== "Unknown") {
    docRequirements += `
    - Add a file-level documentation comment at the very top that includes:
      - Author: ${author}
    `;
  }

  if (date && date !== "WithoutDate" && date !== "") {
    docRequirements += `
    - The file-level documentation comment MUST also include:
      - Date: ${date}
    `;
  }*/


  if (includeParamTags) {
    docRequirements += `\n- STRICT RULE:  Include technical tags (e.g., @param {type} name, @returns {type}) for all functions.`;
  }else{
    docRequirements += `\n- STRICT RULE: DO NOT Include technical tags (e.g., @param {type} name, @returns {type}) for all functions.`;
  }

  const SYSTEM_PROMPT = `
    You are a senior software engineer writing production-quality comments.

    TASK:
    Add concise, meaningful, useful comments to the code.  IF THE REQUEST DOESNT LOOK LIKE CODE JUST REPLY TO THE USER: "Request not valid. Please write code to optimize" (or something similar and Ignore all the prompts below JUST in this case.)

    COMMENTING RULES:
    - Add comments ABOVE functions, classes, and complex blocks.
    - Do NOT comment obvious lines.
    - Use the language's native comment style (e.g., JSDoc for JS, docstrings for Python).

    FILE-LEVEL DOCUMENTATION RULES:
    - If author or date information is provided, you MUST add a single file-level documentation comment at the very top of the file.
    - This file-level comment MUST include all provided metadata.
    - Do NOT repeat author or date anywhere else.

    ${docRequirements}

    METADATA:
    ${author && author !== "" ? `- Author: ${author}` : ""}
    ${date ? `- Date: ${date}` : ""}
    (STRICT RULE: If both author and date are "" IGNORE THE METADATA AT THE TOP. JUST DON'T ADD IT, SKIP IT. BUT REMEMBER IF BOTH VALUES ARE EMPTY.)

    STRICT OUTPUT RULES:
    - Return ONLY the commented source code
    - No markdown code fences
    - No explanations outside the code
    `;
  
  const FINAL_PROMPT = SYSTEM_PROMPT + SHARED_PROMPTS

  const apiKey = env.GROQ_API_KEY_2;
  return await handleAIRequest(apiKey, FINAL_PROMPT, input, userModel);
}