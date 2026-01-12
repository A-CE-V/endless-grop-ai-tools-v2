// helpers/codeFencesRemover.js
export function stripMarkdownCodeFences(text) {
  return text.replace(/^```[\w-]*\n/, "").replace(/\n```$/, "");
}
