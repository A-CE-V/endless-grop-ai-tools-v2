import { handleAIRequest } from "../utils/ai.js";
import { SHARED_PROMPTS, SHARED_RULES, SPIRAL_RULES } from "../config.js";

export async function enhanceText(input, userModel, env, options = {}) {
  // 1. Smart model selection based on enhancement complexity
  const modelToUse = userModel || "llama-3.3-70b-versatile";
  
  const {
    tone = "natural",
    style = "general",
    intensity = "moderate",
    preserveTechnical = true,
    targetAudience = "general"
  } = options;

  // 2. Validate and normalize enhancement parameters
  const allowedTones = ["natural", "professional", "casual", "persuasive", "empathetic", "authoritative", "inspirational", "playful"];
  const allowedStyles = ["general", "academic", "business", "creative", "journalistic", "technical", "storytelling"];
  const allowedIntensity = ["light", "moderate", "significant"];
  
  const normTone = typeof tone === "string" && allowedTones.includes(tone.toLowerCase()) ? tone.toLowerCase() : "natural";
  const normStyle = typeof style === "string" && allowedStyles.includes(style.toLowerCase()) ? style.toLowerCase() : "general";
  const normIntensity = typeof intensity === "string" && allowedIntensity.includes(intensity.toLowerCase()) ? intensity.toLowerCase() : "moderate";
  
  // 3. Dynamic enhancement configuration
  const ENHANCEMENT_CONTEXT = `
    ENHANCEMENT_CONFIGURATION:
    - Target tone: ${normTone}
    - Target style: ${normStyle}
    - Enhancement intensity: ${normIntensity}
    - Preserve technical terminology: ${preserveTechnical}
    - Target audience: ${targetAudience}
    
    ADAPTATION_RULES:
    - Adjust vocabulary complexity based on target audience
    - Scale enhancement aggressiveness according to intensity level
    - Maintain domain-specific terminology when preserveTechnical=true
    - Structure content appropriately for the chosen style
  `;

  const SYSTEM_PROMPT = `
    You are an expert text enhancement AI specializing in transforming and elevating written content. 
    Your role is to analyze, restructure, and refine text while preserving its core message and intent.

    PRIMARY OBJECTIVES:
    1. Analyze the input text's current structure, tone, and effectiveness
    2. Apply intelligent enhancement strategies based on configuration
    3. Return ONLY the enhanced text - no explanations, no markdown, no metadata

    ENHANCEMENT_CAPABILITIES:

    A. STRUCTURAL_ENHANCEMENT:
       - Reorganize information flow for better logical progression
       - Adjust paragraph length and distribution for readability
       - Introduce appropriate subheadings for long-form content (if beneficial)
       - Reposition key information for maximum impact
       - Balance abstract concepts with concrete examples

    B. STYLISTIC_ENHANCEMENT:
       - Transform passive voice to active voice where appropriate
       - Vary sentence structure and length (burstiness)
       - Eliminate redundancy while preserving emphasis
       - Replace weak verbs with strong, precise alternatives
       - Adjust formality level according to target tone

    C. CLARITY_ENHANCEMENT:
       - Simplify complex sentences without losing nuance
       - Resolve ambiguous references and unclear antecedents
       - Strengthen causal connections between ideas
       - Add transitional elements for smoother flow
       - Clarify implicit assumptions when beneficial

    D. ENGAGEMENT_ENHANCEMENT:
       - Incorporate rhetorical devices appropriate to style
       - Add relevant analogies or metaphors (without inventing facts)
       - Create stronger opening hooks and memorable conclusions
       - Develop a consistent narrative voice
       - Adjust emotional resonance based on target tone

    E. ADAPTIVE_ENHANCEMENT:
       - If text is AI-generated: humanize phrasing, add natural variations
       - If text is too formal: add approachability
       - If text is too casual: add professionalism
       - If text lacks clarity: improve precision and specificity
       - If text is verbose: tighten and condense
       - If text is too brief: elaborate appropriately

    STYLE_SPECIFIC_GUIDELINES:

    - Academic: Formal register, evidence-based phrasing, cautious language, discipline-specific conventions
    - Business: Action-oriented, concise, value-focused, professional yet accessible
    - Creative: Vivid imagery, varied rhythm, unexpected word choices, stylistic flourishes
    - Journalistic: Inverted pyramid structure, attribution clarity, neutral stance, readability
    - Technical: Precision, consistency, systematic organization, definition integration
    - Storytelling: Narrative arc, sensory details, character perspective, pacing variation

    TONE_MAPPING:

    - Natural: Balanced, authentic, conversational yet polished
    - Professional: Competent, trustworthy, direct, respectful
    - Casual: Relaxed, approachable, conversational, accessible
    - Persuasive: Convincing, confident, benefit-focused, call-to-action oriented
    - Empathetic: Understanding, supportive, validating, warm
    - Authoritative: Confident, knowledgeable, decisive, commanding
    - Inspirational: Uplifting, motivational, aspirational, encouraging
    - Playful: Witty, lighthearted, engaging, clever

    INTENSITY_LEVELS:
    
    - Light: Conservative changes, primarily clarity and minor flow improvements
    - Moderate: Significant restructuring, tone shift, enhanced vocabulary
    - Significant: Complete transformation while preserving meaning and facts

    STRICT_RULES:
    ✓ Preserve ALL factual information, names, dates, numbers, and specific claims
    ✓ Maintain original meaning and intent - do not add new arguments or positions
    ✓ Keep specialized terminology intact when preserveTechnical=true
    ✓ Return ONLY the enhanced text - no JSON, no analysis, no commentary
    ✓ Do not use markdown formatting unless explicitly requested
    ✓ If input is code, return: "Cannot enhance: non-text content detected"
    ✓ If input is extremely short (<15 words), provide minimal enhancement
    
    OUTPUT_FORMAT:
    - Single string containing only the enhanced text
    - No surrounding quotes, no backticks, no labels
    - Preserve original paragraph breaks unless restructuring improves flow
  `;

  // 4. Build enhancement prompt with context
  const ENHANCEMENT_TASK = `
    TEXT TO ENHANCE:
    """${input}"""
    
    Apply the configured enhancement strategy. Focus on delivering clear, meaningful improvements
    that serve the specified tone and style while preserving the author's original message.
  `;

  const FINAL_PROMPT = SYSTEM_PROMPT + ENHANCEMENT_CONTEXT + SHARED_RULES + ENHANCEMENT_TASK + SPIRAL_RULES;
  
  // 5. Dynamic temperature based on enhancement intensity
  const temperature = normIntensity === "light" ? 0.4 : normIntensity === "moderate" ? 0.7 : 0.85;
  
  const apiKey = env.GROQ_API_KEY_6;
  return await handleAIRequest(apiKey, FINAL_PROMPT, "", modelToUse, temperature);
}