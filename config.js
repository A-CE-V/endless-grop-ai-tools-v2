
export const CONFIG = {
  textModels: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "moonshotai/kimi-k2-instruct-0905",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3-32b"
  ],
};

export const MAX_LIMITS = {
  "/api/comment-remover": 20_000,
  "/api/comment-adder": 15_000,
  "/api/optimizer": 15_000,
  "/api/detector": 10_000,
  "/api/explainer": 20_000
};
