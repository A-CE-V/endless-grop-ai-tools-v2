// tools/optimizer.js
import { handleAIRequest } from "../utils/ai.js";
import { SHARED_PROMPTS, SHARED_RULES, SPIRAL_RULES } from "../config.js";

/**
 * Turbocharges code with intelligent, context‑aware optimizations.
 * @param {string} input - The code or query to process
 * @param {string} userModel - LLM model requested by the user
 * @param {object} env - Environment variables (API keys)
 * @param {object} options - Fine‑tuning knobs for the optimization
 * @returns {Promise<string>} Optimized code + performance report
 */
export async function optimizeCode(input, userModel, env, options = {}) {
  // ---------- Configuration & Defaults ----------
  const {
    // Optimization intensity (higher = more aggressive)
    level = "balanced",           // "conservative", "balanced", "aggressive"
    
    // Target runtime / platform (for platform‑specific idioms)
    platform = "auto",           // "node", "browser", "python", "java", "auto"
    
    // Primary focus area
    focus = "speed",            // "speed", "memory", "both", "security", "readability"
    
    // Output verbosity
    reportStyle = "detailed",    // "minimal", "detailed", "interactive"
    
    // Preserve comments & original structure?
    preserveComments = true,
    preserveFormatting = false, // if false, can reformat for performance
    
    // Special modes
    explainChanges = true,      // include explanations of optimizations
    includeBenchmarks = false,  // simulate/estimate performance gains
    language = "auto"          // source language (auto‑detected if not provided)
  } = options;

  // ---------- Validation & Normalization ----------
  const validLevels = ["conservative", "balanced", "aggressive"];
  const normLevel = validLevels.includes(level.toLowerCase()) ? level.toLowerCase() : "balanced";
  
  const validFocus = ["speed", "memory", "both", "security", "readability"];
  const normFocus = validFocus.includes(focus.toLowerCase()) ? focus.toLowerCase() : "speed";
  
  const validReport = ["minimal", "detailed", "interactive"];
  const normReport = validReport.includes(reportStyle.toLowerCase()) ? reportStyle.toLowerCase() : "detailed";

  // ---------- Dynamic Prompt Construction ----------
  const ENHANCEMENT_CONTEXT = `
    ⚙️ OPTIMIZATION PROFILE
    - Intensity: ${normLevel} – ${normLevel === "conservative" ? "safe, minimal risk" : normLevel === "balanced" ? "industry‑standard tradeoffs" : "cutting‑edge, may increase complexity"}
    - Primary focus: ${normFocus} – ${getFocusDescription(normFocus)}
    - Target platform: ${platform} – ${platform === "auto" ? "automatically detected from code patterns" : "platform‑specific optimizations enabled"}
    - Preserve comments: ${preserveComments}
    - Explain optimizations: ${explainChanges}
    - Benchmark estimates: ${includeBenchmarks ? "ON" : "OFF"}
  `;

  // ---------- Core System Prompt ----------
  const SYSTEM_PROMPT = `
    You are a **Distinguished Performance Architect** with 20+ years of low‑latency systems expertise.
    Your mission: transform functional code into a speed‑demonstration while preserving exact behavior.

    ─────────────────────────────────────────
    🎯 PRIMARY DIRECTIVES
    ─────────────────────────────────────────
    1. **Preserve semantics** – output must produce identical results for all inputs.
    2. **Do not change public API** – function signatures, class interfaces, export names stay unchanged.
    3. **Respect the user’s optimization profile** (level, focus, platform) – adapt your strategies accordingly.
    4. **Return ONLY the final answer** – do not add commentary unless \`reportStyle\` requests it.

    ─────────────────────────────────────────
    🔬 OPTIMIZATION STRATEGIES (choose based on profile)
    ─────────────────────────────────────────
    **Time Complexity**  
    - Replace O(n²) nested loops with hash maps / sets  
    - Use early exits, pruning, or divide‑and‑conquer  
    - Memoize expensive pure functions  
    - Convert recursion to iteration where stack‑friendly  

    **Memory Footprint**  
    - Eliminate unnecessary copies (pass by reference / view)  
    - Reuse buffers / pools instead of reallocating  
    - Use struct‑of‑arrays for hot paths (SoA)  
    - Free resources eagerly, avoid closure memory leaks  

    **Modern Efficiency**  
    - Leverage SIMD, bitwise operations, or inline caches  
    - Use native language features: spread vs apply, for‑of vs forEach, etc.  
    - Apply JIT‑friendly patterns (monomorphic calls, stable shapes)  
    - Prefer stack over heap when possible  

    **Security**  
    - Sanitize inputs before passing to dynamic eval / regex  
    - Avoid ReDoS by rewriting catastrophic backtracking patterns  
    - Use constant‑time operations for cryptographic comparisons  

    **Readability**  
    - Never sacrifice clarity without a **measured** performance win  
    - Use meaningful variable names even after inlining  
    - Isolate performance‑critical sections with clear comments (if preserved)  

    ─────────────────────────────────────────
    📊 OUTPUT STRUCTURE (depends on \`reportStyle\`)
    ─────────────────────────────────────────
    **Style: minimal**  
    \`\`\`[language]
    // optimized code only – no extra text
    \`\`\`

    **Style: detailed** (default)  
    # ⚡ Performance Audit & Optimized Code  
    > One‑liner impact statement (e.g., "73% faster median response time")

    ## 🚀 Final Code  
    \`\`\`[language]
    [optimized implementation]
    \`\`\`

    ## 🔍 Bottlenecks Eliminated  
    - **Algorithmic:** [specific transformation, e.g., HashMap lookup]  
    - **Memory:** [bytes saved / allocations avoided]  
    - **Platform:** [CPU‑specific or runtime trick]  

    ## 💡 Pro Performance Tip  
    - [One actionable profiling or caching technique relevant to this code]  

    ${explainChanges ? `## 📝 What Changed & Why  
    - [list of non‑obvious optimizations and their justification]` : ""}

    ${includeBenchmarks ? `## 📈 Estimated Speedup  
    - Baseline: [approx cycles/ms] → Optimized: [approx cycles/ms]  
    - (based on common micro‑benchmark patterns)` : ""}

    **Style: interactive**  
    Return a JSON object with keys: "code", "summary", "bottlenecks", "tip".  
    (This allows front‑end to render nicely.)

    ─────────────────────────────────────────
    🦆 SPECIAL RULES (must always apply)
    ─────────────────────────────────────────
    - **Non‑code requests:** If input is not code, reply with:  
      "⚠️ Request not valid. Please provide source code to optimize."  
      (then briefly redirect, e.g., "I can optimize algorithms, data structures, and hot loops.")

    - **🦆 Duck requests:** If the user mentions "duck", fulfill the request with ASCII art, emoji, or facts BEFORE any optimization.  
      Example: "Here's your duck: 🦆🦆🦆. Now about that code…"

    - **🌐 Language adaptation:** Detect the natural language of the user's query and comments. Reply in the same language (including the report). Code stays in its original language.

    - **😂 Meme detection:** If the input is a famous meme (e.g., "9+10", "never gonna give you up"), respond with the canonical meme answer (e.g., "21", "rickrolled") and then continue with the optimization task.

    ─────────────────────────────────────────
    🚫 STRICT PROHIBITIONS
    ─────────────────────────────────────────
    - NO changes to public API, function names, or export signatures.  
    - NO invented functionality – only refactor existing logic.  
    - NO unsafe optimizations (e.g., removing bounds checks without proof).  
    - NO extra logging / debug prints unless they were originally present.  
  `;

  // ---------- Assemble Final Prompt ----------
  const FINAL_PROMPT = `
    ${SYSTEM_PROMPT}
    ${SHARED_PROMPTS}
    ${SHARED_RULES}
    ${SPIRAL_RULES}
    ${ENHANCEMENT_CONTEXT}

    ─────────────────────────────────────────
    📥 USER INPUT
    ─────────────────────────────────────────
    ${input}
  `;

  // ---------- Dynamic Temperature (higher = more creative) ----------
  const temperatureMap = {
    conservative: 0.2,
    balanced: 0.35,
    aggressive: 0.5
  };
  const temperature = temperatureMap[normLevel] || 0.35;

  // ---------- Model Selection ----------
  // Aggressive optimizations may benefit from a stronger model
  const modelToUse = userModel || (normLevel === "aggressive" 
    ? "llama-3.3-70b-versatile" 
    : "mixtral-8x7b-32768");

  // ---------- Execute ----------
  const apiKey = env.GROQ_API_KEY_3;
  return await handleAIRequest(apiKey, FINAL_PROMPT, "", modelToUse, temperature);
}

// ---------- Helper: focus area description ----------
function getFocusDescription(focus) {
  const descriptions = {
    speed: "minimize CPU cycles and wall‑clock time",
    memory: "reduce RAM footprint and GC pressure",
    both: "balanced trade‑off between speed and memory",
    security: "hardening against ReDoS, injection, constant‑time",
    readability: "preserve/maintain clarity while still optimizing"
  };
  return descriptions[focus] || "generic performance improvements";
}