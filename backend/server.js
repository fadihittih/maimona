/**
 * mAImona Backend Server
 * Secure Node.js backend for Gemini API chat integration
 */

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS =====
// نسمح لموقع الماي مونا + GitHub Pages + localhost للتجربة
const allowedOrigins = [
  "https://fadihittih.github.io",
  "https://fadihittih.github.io/maimona",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // للسيرفرات/التست
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".github.io")
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ===== System Instruction =====
const SYSTEM_INSTRUCTION = `You are mAImona, an AI-powered crypto market assistant integrated into a live market dashboard.
Your role:
- Explain cryptocurrency market data clearly and accurately.
- Use only reliable market data and provided tools/context.
- You are NOT a trading signal provider.
- Do NOT give explicit 'buy', 'sell', or 'open a position' recommendations.
- Do NOT guarantee future prices.
- If data is missing or uncertain, say you are not sure instead of guessing.
- Keep responses concise, practical, and focused on clarification and education.
- Always treat your outputs as informational, not financial advice.
- If asked about topics outside crypto/finance/your scope, politely say your role is limited to crypto market information.
Technical:
- Assume you may receive structured market context from the frontend.
- Never expose API keys, internal configs, or backend implementation details in responses.
Always act consistently as 'mAImona'.`;

// ===== Gemini Init =====
const apiKey = process.env.GEMINI_API_KEY;
let model = null;
let hasModel = false;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set");
} else {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // استخدم موديل ثابت مدعوم
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    hasModel = true;
    console.log("✅ Gemini model initialized successfully");
  } catch (err) {
    console.error("❌ Failed to initialize Gemini model:", err.message);
  }
}

// ===== Health Check =====
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasModel,
    message: "mAImona backend is running",
  });
});
app.post("/api/chat", async (req, res) => {
  try {
    if (!hasModel || !model) {
      return res.status(500).json({
        error: "AI backend is not configured correctly. Please check GEMINI_API_KEY.",
      });
    }

    const { message, marketContext } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Invalid request: 'message' is required.",
      });
    }

    let promptText;

    if (marketContext && typeof marketContext === "string" && marketContext.trim()) {
      promptText =
        `You are mAImona.\n` +
        `Here is current market context:\n${marketContext.trim()}\n\n` +
        `User question:\n${message.trim()}`;
    } else {
      promptText =
        `You are mAImona.\n` +
        `User question:\n${message.trim()}`;
    }

    // 🔹 الشكل المضمون مع Gemini SDK
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
    });

    const reply = result?.response?.text?.();

    if (!reply || !reply.trim()) {
      console.error("⚠️ Empty reply from Gemini:", JSON.stringify(result, null, 2));
      return res.status(500).json({
        error: "I received an empty response from the AI service. Please try again.",
      });
    }

    return res.json({ reply: reply.trim() });

  } catch (err) {
    console.error("❌ Error in /api/chat:", err?.message || err);
    if (err?.response?.data) {
      console.error("🔍 Gemini response data:", JSON.stringify(err.response.data, null, 2));
    }
    return res.status(500).json({
      error:
        "I apologize, but I encountered an error processing your request. Please try again in a moment.",
    });
  }
  // ===== 404 =====
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 mAImona backend listening on port ${PORT}`);
}); 
});