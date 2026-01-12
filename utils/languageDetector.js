// utils/languageDetector.js
export function detectLanguage(code) {
  if (/^\s*<(!DOCTYPE|html)/i.test(code)) return "HTML";
  if (/^\s*{[\s\S]*}$/.test(code)) return "JSON";
  if (/function\s|\bconst\b|\blet\b|\bvar\b/.test(code)) return "JavaScript";
  if (/\bdef\s+\w+\s*\(/.test(code)) return "Python";
  if (/\bclass\s+\w+.*\{/.test(code)) return "Java";
  if (/#include\s+<\w+>/.test(code)) return "C++";
  if (/package\s+main|fmt\./.test(code)) return "Go";
  if (/<?php/.test(code)) return "PHP";
  return "Unknown";
}
