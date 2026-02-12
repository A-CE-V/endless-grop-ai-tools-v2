// index.js
import express from "express";
import dotenv from "dotenv";
import { performance } from "perf_hooks";

dotenv.config();

import { MAX_LIMITS } from "./config.js";
import { detectLanguage } from "./utils/languageDetector.js";
import { validateInput } from "./helpers/inputValidator.js";

import { processDetector } from "./tools/detector.js";
import { processOptimizer } from "./tools/optimizer.js";
import { processCommentRemover } from "./tools/commentRemover.js";
import { processCommentAdder } from "./tools/commentAdder.js";
import { processExplainer } from "./tools/explainer.js";
import { processHumanizer } from "./tools/humanizer.js";

import { editComments } from "./tools/spiralCommentEditor.js";
import { explainCode} from "./tools/spiralExplainer.js"
import { optimizeCode } from "./tools/spiralOptimizer.js";
import { enhanceText } from "./tools/spiralTextEnhancer.js"

import { verifyInternalKey } from "./auth/internalApiKeyHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(
  "/api",
  express.json({
    limit: "5mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);


app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post(/^\/api\/.*/, verifyInternalKey, async (req, res) => {
  const startTime = performance.now();
  try {
    const toolPath = req.path;

  
    const { input, userModel, author, date, includeParamTags } = req.body;

    const normalizedAuthor =
      typeof author === "string" && author.trim()
        ? author.trim()
        : "Unknown";

    const normalizedDate =
      typeof date === "string" && date.trim()
        ? date.trim()
        : "";

    const normalizedIncludeParamTags =
      includeParamTags === true || includeParamTags === "true";


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

      case "/api/explainer":
        toolName = "explainer";
        resultData = await processExplainer(input, userModel, process.env);
        break;
      
      case "/api/humanizer":
        toolName = "humanizer";
        const { personality } = req.body;
        resultData = await processHumanizer(input, userModel, process.env, {personality});
        break;

      case "/api/comment-adder":
        toolName = "commentAdd";
        resultData = await processCommentAdder(input, userModel, process.env, { author: normalizedAuthor, date: normalizedDate, includeParamTags: normalizedIncludeParamTags});
        break;

      case "/api/v2/optimizer":
        toolName = "optimizer";
        resultData = await optimizeCode(input, userModel, process.env);
        break;
      
      case "/api/v2/text-enhancer":
        toolName = "textEnhancer";
        resultData = await enhanceText(input, userModel, process.env);
        break;
      
      case "/api/v2/explainer":
        toolName = "explainer";
        resultData = await explainCode(input, userModel, process.env);
        break;

      case "/api/v2/comment-editor":
        toolName = "commentEditor";
        resultData = await editComments(input, userModel, process.env);
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
