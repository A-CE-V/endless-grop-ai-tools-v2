// tools/commentEditor.js
import { SHARED_PROMPTS, SHARED_RULES, SPIRAL_RULES } from "../config.js";
import { handleAIRequest } from "../utils/ai.js";

/**
 * Intelligently edits code comments – add, remove, refactor, or translate.
 * @param {string} input - Code + optional natural language instructions
 * @param {string} userModel - LLM model requested by the user
 * @param {object} env - Environment variables (API keys)
 * @param {object} options - Fine‑tuning parameters for comment editing
 * @returns {Promise<string>} Formatted documentation report + updated code
 */
export async function editComments(input, userModel, env, options = {}) {
  // ---------- Configuration & Defaults ----------
  const {
    // Primary action
    action = "auto",            // "add", "remove", "refactor", "translate", "auto"
    
    // Documentation style (auto‑detect from code or explicit)
    style = "auto",            // "jsdoc", "tsdoc", "epydoc", "doxygen", "reST", "markdown", "auto"
    
    // Granular control
    preserveTodos = false,     // Keep // TODO: notes? (if removing)
    preserveCommentedCode = false, // Keep commented‑out code blocks? (usually strip)
    addDocstrings = true,      // Add missing function/class docstrings
    addInlineExplanations = false, // Add "why" comments to complex logic
    
    // Translation
    translateTo = null,        // e.g., "es", "fr", "zh" – if action=translate
    
    // Output verbosity
    reportStyle = "compact",   // "compact", "detailed", "interactive"
    
    // Tone
    tone = "professional"      // "professional", "friendly", "educational"
  } = options;

  // ---------- Validation & Normalization ----------
  const validActions = ["auto", "add", "remove", "refactor", "translate"];
  const normAction = validActions.includes(action?.toLowerCase()) 
    ? action.toLowerCase() : "auto";
  
  const validStyles = ["auto", "jsdoc", "tsdoc", "epydoc", "doxygen", "rest", "markdown"];
  const normStyle = validStyles.includes(style?.toLowerCase()) 
    ? style.toLowerCase() : "auto";
  
  const validReport = ["compact", "detailed", "interactive"];
  const normReport = validReport.includes(reportStyle?.toLowerCase()) 
    ? reportStyle.toLowerCase() : "compact";
  
  const validTones = ["professional", "friendly", "educational"];
  const normTone = validTones.includes(tone?.toLowerCase()) 
    ? tone.toLowerCase() : "professional";

  // ---------- Dynamic Prompt Construction ----------
  const ACTION_PROFILE = `
    🎯 ACTION: ${normAction}
    ${normAction === "auto"
      ? " - Detect the user's intent from their input. Keywords: 'add', 'write', 'document', 'remove', 'strip', 'delete', 'refactor', 'improve', 'translate', 'spanish', etc."
      : normAction === "add"
        ? " - ADD comments: Write clear, concise explanations. Focus on WHY, not just WHAT. Add JSDoc/docstrings to functions/classes. Add inline notes for non‑obvious logic."
        : normAction === "remove"
          ? " - REMOVE comments: Strip all non‑essential comments. Keep only rare, absolutely necessary explanations. Remove TODOs? ${preserveTodos ? 'NO (keep)' : 'YES (strip)'}. Remove commented‑out code? ${preserveCommentedCode ? 'NO (keep)' : 'YES (strip)'}."
          : normAction === "refactor"
            ? " - REFACTOR comments: Rewrite vague, outdated, or poorly written comments into professional documentation. Preserve all useful information, improve clarity and consistency."
            : " - TRANSLATE comments: Detect original comment language and translate to ${translateTo || 'user‑specified language'}. Keep code identifiers unchanged."
    }
  `;

  const STYLE_PROFILE = `
    📐 DOCUMENTATION STYLE: ${normStyle}
    ${normStyle === "auto"
      ? " - Detect from file extension, shebang, or existing comment style. Fallback to JSDoc for JS/TS, PEP 257 for Python, Doxygen for C++/Java, Markdown for plaintext."
      : ` - Enforce ${normStyle.toUpperCase()} conventions strictly. Follow official style guides.`
    }
  `;

  const OUTPUT_PROFILE = `
    📋 REPORT STYLE: ${normReport}
    ${normReport === "compact"
      ? " - Brief summary + code block. Minimal narrative."
      : normReport === "detailed"
        ? " - Full report: Documentation Report header, bullet changes, pro tip."
        : " - Return JSON: { summary: string, code: string, changes: { added: string[], removed: string[], style: string }, tip: string }"
    }
  `;

  // ---------- Core System Prompt ----------
  const SYSTEM_PROMPT = `
    You are a **Senior Documentation Architect** – an engineer who makes code speak clearly.  
    Your work never changes functionality; you sculpt comments into wisdom.

    ─────────────────────────────────────────
    🧠 CORE PRINCIPLES
    ─────────────────────────────────────────
    1. **ZERO functional changes** – Never alter a single line of executable code. Only edit comments, docstrings, and whitespace around them.
    2. **Why > What** – Explain the reasoning, tradeoffs, and intent behind code, not just what it does.
    3. **Respect existing style** – When in doubt, match the project's existing comment patterns.
    4. **Clarity over cleverness** – Simple, direct language beats fancy jargon.
    5. **Action‑focused** – Execute the user's request exactly as specified via options or natural language.

    ─────────────────────────────────────────
    ⚙️ CONFIGURATION (must obey)
    ─────────────────────────────────────────
    ${ACTION_PROFILE}
    ${STYLE_PROFILE}
    ${OUTPUT_PROFILE}
    
    Tone: ${normTone} – ${normTone === "professional" 
      ? "concise, authoritative, business‑ready." 
      : normTone === "friendly" 
        ? "approachable, encouraging, uses occasional 'you'." 
        : "teaching‑oriented, explains *why* the comment style matters, hints at best practices."}

    ${translateTo ? `🌐 TRANSLATION TARGET: ${translateTo}. Translate ALL comment text to this language. Do not translate code, strings, or identifiers.` : ""}

    ─────────────────────────────────────────
    📏 DOCUMENTATION STYLE GUIDES (by language)
    ─────────────────────────────────────────
    - **JavaScript/TypeScript:** JSDoc/TSDoc. Use @param, @returns, @throws, @example. Markdown inside descriptions.
    - **Python:** PEP 257 docstrings. Triple quotes. Google style or NumPy style – detect from existing.
    - **Java:** Doxygen / Javadoc. /** ... */ with @param, @return.
    - **C/C++:** Doxygen. /// or /** ... */.
    - **C#:** XML doc comments. /// <summary>...
    - **Ruby:** RDoc.
    - **PHP:** PHPDoc.
    - **Rust:** /// doc comments, //! module docs.
    - **Go:** // func comments, no special tag.
    - **SQL:** -- line comments above statements.
    - **Plain text / config:** # or ; comments, keep minimal.

    ─────────────────────────────────────────
    🦆 SPECIAL RULES (always apply)
    ─────────────────────────────────────────
    - **Non‑code requests:** If input contains no code (or only conversational text), reply:  
      "I'd love to chat, but I'm optimized for code comments. Please paste the code you'd like me to document."  
      (If duck/meme requests, handle them FIRST with humor, then redirect.)

    - **🦆 Duck requests:** User mentions "duck"? Fulfill instantly with ASCII art, emoji, or fact. Then proceed.

    - **😂 Meme detection:** Recognise classic memes (9+10, never gonna give you up, etc.) – reply with meme answer, then continue.

    - **🌐 Language adaptation:** Detect the user's natural language (from input or explicit option). Reply in that language. Translate comments accordingly if action=translate.

    ─────────────────────────────────────────
    🚫 STRICT PROHIBITIONS
    ─────────────────────────────────────────
    - NO functional code changes – zero. This is non‑negotiable.
    - NO hallucinations – do not invent APIs or functions.
    - NO placeholder comments like "// add your code here" – unless originally present.
    - NO removal of license headers or copyright notices.
    - NO markdown inside code blocks – keep them clean.
    - NO extra commentary beyond the requested report style.

    ─────────────────────────────────────────
    📤 OUTPUT
    ─────────────────────────────────────────
    ${normReport === "interactive" 
      ? "Return **only** a valid JSON object. No markdown, no other text."
      : "Return a Markdown document. Use headings, code fences, and bullet lists as described."}
  `;

  // ---------- Assemble Final Prompt ----------
  const FINAL_PROMPT = `
    ${SYSTEM_PROMPT}
    ${SHARED_PROMPTS}
    ${SHARED_RULES}
    ${SPIRAL_RULES}

    ─────────────────────────────────────────
    📥 USER INPUT
    ─────────────────────────────────────────
    ${input}
  `;

  // ---------- Dynamic Temperature ----------
  // Different actions need different creativity levels
  const temperatureMap = {
    remove: 0.2,     // deterministic, safe
    refactor: 0.5,   // balanced
    add: 0.6,        // some creativity for phrasing
    translate: 0.4,  // precise
    auto: 0.5,
    default: 0.4
  };
  const temperature = temperatureMap[normAction] || temperatureMap.default;

  // ---------- Model Selection ----------
  // Heavy refactoring may need stronger model
  const modelToUse = userModel || (
    normAction === "refactor" || normAction === "add"
      ? "llama-3.3-70b-versatile" 
      : "mixtral-8x7b-32768"
  );

  const apiKey = env.GROQ_API_KEY_1;
  return await handleAIRequest(apiKey, FINAL_PROMPT, "", modelToUse, temperature);
}