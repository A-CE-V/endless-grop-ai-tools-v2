// index.js
import express from "express";
import dotenv from "dotenv";
import { performance } from "perf_hooks";

dotenv.config();

import { MAX_LIMITS } from "./config.js";
import { detectLanguage } from "./utils/languageDetector.js";
import { validateInput } from "./helpers/inputValidator.js";

// tools
import { processDetector } from "./tools/detector.js";
import { processOptimizer } from "./tools/optimizer.js";
import { processCommentRemover } from "./tools/commentRemover.js";
import { processCommentAdder } from "./tools/commentAdder.js";

import { verifyInternalKey } from "./auth/internalApiKeyHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;


app.use("/api", express.raw({ type: "*/*", limit: "5mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/:tool", verifyInternalKey, async (req, res) => {
  const startTime = performance.now();
  try {
    const toolPath = `/api/${req.params.tool}`;

    const bodyText = req.body && req.body.length ? req.body.toString("utf8") : "";
    const body = bodyText ? JSON.parse(bodyText) : {};
    const { input, userModel } = body;

    if (!input) throw new Error("Input payload is required");

    const maxChars = MAX_LIMITS[toolPath];
    if (!maxChars) throw new Error(`Unknown endpoint: ${toolPath}`);

    const inputLength = validateInput(input, maxChars);

    let resultData;
    let toolName = "";

    switch (toolPath) {
      case "/api/detector":
        toolName = "detector";
        {
          const raw = await processDetector(input, userModel, process.env);
          let parsed;
          try {
            parsed = JSON.parse(raw.content);
          } catch (e) {
            throw new Error("Detector returned invalid JSON");
          }
          resultData = {
            model: raw.model,
            detection: parsed,
          };
        }
        break;

      case "/api/optimizer":
        toolName = "optimizer";
        resultData = await processOptimizer(input, userModel, process.env);
        break;

      case "/api/comment-remover":
        toolName = "commentRemove";
        resultData = await processCommentRemover(input, userModel, process.env);
        break;

      case "/api/comment-adder":
        toolName = "commentAdd";
        resultData = await processCommentAdder(input, userModel, process.env);
        break;

      default:
        throw new Error(`Endpoint not found: ${toolPath}`);
    }

    const endTime = performance.now();
    const detectedLanguage = detectLanguage(input);
    const isDetector = toolName === "detector";

    return res.json({
      success: true,
      result: isDetector ? null : resultData.content,
      meta: {
        inputLength,
        time_used_ms: `${(endTime - startTime).toFixed(2)}ms`,
        model: resultData.model,
        tool: toolName,
        endpoint: toolPath,
        detectedLanguage,
        ...(isDetector && {
          ai_probability: resultData.detection.ai_probability,
          confidence: resultData.detection.confidence,
          reasoning: resultData.detection.reasoning,
        }),
      },
    });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
