// helpers/codeFencesRemover.js
export function stripMarkdownCodeFences(text) {
  return text
    .trim()
    .replace(/^```[\w-]*\r?\n/, "")  // opening fence
    .replace(/\r?\n```\s*$/, "")     // closing fence
    .trim();
}