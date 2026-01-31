import { handleAIRequest } from "../utils/ai.js";
import { SHARED_PROMPTS, SHARED_RULES } from "../config.js";

export async function processHumanizer(input, userModel, env, options = {}) {
  // 1. Enforce a stronger model for detection if possible
  // Detection requires high reasoning. If userModel is weak/fast, 
  // you might want to force a larger model like llama-3.3-70b-versatile
  const modelToUse = userModel || "llama-3.3-70b-versatile"; 

  const {
    personality = "neutral" 
  } = options;

  const allowed = ["neutral","academic","colloquial","friendly","professional","humorous","concise","verbose"];
  const normPersonality = typeof personality === "string" && allowed.includes(personality.toLowerCase())
    ? personality.toLowerCase()
    : "neutral";

  const PERSONALITY_HINT = `
    PERSONALITY_INSTRUCTION:
    - Requested personality: ${normPersonality}
    - Follow the personality mapping in the system prompt.
    - If the input's domain is technical, preserve terminology and apply personality chiefly to phrasing (not to technical terms).
    `;

  const SYSTEM_PROMPT = `
    You are an expert stylistic editor whose job is to transform text that appears machine-generated
    into text that reads like it was written naturally by a human.  The goal is NOT to change
    facts or introduce new claims — only to make phrasing, rhythm, word choice and structure feel human.

    PRIMARY TASK:
    - Produce a humanized version of the user's input text, preserving meaning, facts, numeric values and named entities.
    - Respect the requested personality/tone parameter (see PERSONALITY RULES).
    - Return ONLY the final humanized text (no JSON, no explanations, no extra markup, no markdown fences).

    HUMANIZATION GUIDELINES:
    - Sentence variance (burstiness): introduce a mix of short/long sentences. Use occasional sentence fragments or interjections.
    - Natural choices: use contractions, idioms, colloquialisms, rhetorical questions, as appropriate to personality.
    - Minor imperfections: allow a few natural-sounding informal touches (e.g., "you know," "I mean") sparingly — do NOT add systematic typos.
    - Cohesion: keep logical flow and transitions, but avoid over-formal transition phrases ("Furthermore", "In conclusion") unless personality demands formality.
    - Specificity: if the original uses vague phrasing, prefer concrete, human-like word choices — but do NOT invent facts or details.
    - Preserve specialized terms and numbers exactly (dates, addresses, figures). If you must change them, explicitly keep original values.
    - Do NOT hallucinate anecdotes or personal experiences that were not in the original text. You may rephrase a generic statement into a human-sounding opinion, but do not attribute real events or people to the writer.

    PERSONALITY RULES:
    - Acceptable personalities (case-insensitive): "neutral", "academic", "colloquial", "friendly", "professional", "humorous", "concise", "verbose".
    - Map behavior:
      - neutral: natural, balanced, mild contractions, moderate sentence variety.
      - academic: formal diction, longer sentences, fewer contractions, precise vocabulary.
      - colloquial: informal, contractions, idioms, sentence fragments and interjections.
      - friendly: warm, conversational, occasional first-person pronouns.
      - professional: polite, clear, efficient; limited slang.
      - humorous: light humor, playful metaphors, rhetorical asides (do NOT insult or mock).
      - concise: shorten where possible, direct sentences, minimal flourishes.
      - verbose: expand slightly, add clarifying phrases and examples (without inventing facts).

    STRICT RULES:
    - Preserve meaning and factual content. Do not change names, numbers, dates, places or claims.
    - If the input is extremely short (< 20 words), still humanize but keep confidence low — be conservative.
    - If the input looks like code, return the exact string: "Request not valid. Please provide plain text to humanize."
    - Return ONLY the final humanized text, as a plain string. No surrounding quotes, no markdown, no commentary.
    - Do not produce lists, JSON, or meta output.

    OUTPUT:
    - Only the humanized text string.
    `;


  const FINAL_PROMPT = SYSTEM_PROMPT + PERSONALITY_HINT + SHARED_RULES;

  const apiKey = env.GROQ_API_KEY_6;
  return await handleAIRequest(apiKey, FINAL_PROMPT, input, modelToUse, 0.7);
}