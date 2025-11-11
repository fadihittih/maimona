/**
 * mAImona Backend Server
 * Secure Node.js backend for Gemini API chat integration
 */

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- CORS ----------
app.use(
  cors({
    origin: (_origin, callback) => {
      // Allow all origins for demo project
      callback(null, true);
    },
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ---------- System Instruction ----------
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

// ---------- Gemini Setup ----------
const apiKey = process.env.GEMINI_API_KEY;
let model = null;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set");
} else {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    console.log("✅ Gemini model initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Gemini:", err.message);
  }
}

// ---------- Health Check ----------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasModel: !!model,
    message: "mAImona backend is running"
  });
});

// ---------- Chat Endpoint ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { message, marketContext } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res
        .status(400)
        .json({ error: "Invalid request: 'message' is required." });
    }

    if (!model) {
      console.error("❌ /api/chat called without initialized model");
      return res.status(500).json({
        error: "AI service is not configured correctly on the server."
      });
    }

    const parts = [];

    if (
      marketContext &&
      typeof marketContext === "string" &&
      marketContext.trim()
    ) {
      parts.push(`Market Context:\n${marketContext.trim()}`);
    }

    parts.push(`User Question:\n${message.trim()}`);

    const prompt = parts.join("\n\n");

    console.log("📩 /api/chat request", {
      messageLength: message.length,
      hasMarketContext: !!marketContext
    });

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    if (!reply || !reply.trim()) {
      console.error("⚠️ Empty reply from Gemini");
      return res.status(500).json({
        error:
          "I could not generate a reliable answer. Please try again with a clearer question."
      });
    }

    console.log("📤 /api/chat reply length:", reply.length);
    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("❌ Error in /api/chat:", err.message || err);
    res.status(500).json({
      error:
        "I apologize, but I encountered an error processing your request. Please try again in a moment."
    });
  }
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 mAImona backend server started on port ${PORT}`);
});
