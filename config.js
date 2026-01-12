// config.js
export const CONFIG = {
  textModels: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "moonshotai/kimi-k2-instruct-0905",
  ],
};

export const MAX_LIMITS = {
  "/api/comment-remover": 15_000,
  "/api/comment-adder": 15_000,
  "/api/optimizer": 15_000,
  "/api/detector": 8_000,
};
