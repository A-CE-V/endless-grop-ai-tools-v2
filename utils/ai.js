// utils/ai.js
import { CONFIG } from "../config.js";
import { stripMarkdownCodeFences } from "../helpers/codeFencesRemover.js";

/**
 * GENERIC AI HANDLER
 * @param {string} apiKey - The specific API Key to use for this request
 * @param {string} systemPrompt - The instruction for the AI
 * @param {string} input - The user's code or text
 * @param {string} userModel - (Optional) Specific model requested by user
 */
export async function handleAIRequest(apiKey, systemPrompt, input, userModel) {
  let modelsToTry = userModel ? [userModel, ...CONFIG.textModels] : CONFIG.textModels;
  modelsToTry = [...new Set(modelsToTry)];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      if (!apiKey) throw new Error("Server Error: API Key not defined for this tool.");
      console.log("Calling Groq with model:", model);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      // Handle Rate Limits (429) - Try next model
      if (response.status === 429) {
        console.warn(`Rate limit hit on model ${model}. Switching...`);
        throw new Error("RateLimit");
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API Error: ${errText}`);
      }

      const data = await response.json();
      const raw = data.choices[0].message.content;

      return {
        content: stripMarkdownCodeFences(raw),
        model: model,
      };
    } catch (err) {
      lastError = err;
      console.log(`Failed on ${model}: ${err.message}`);
      // Continue to next model
    }
  }

  throw new Error(`All models failed. Last error: ${lastError ? lastError.message : "Unknown"}`);
}
