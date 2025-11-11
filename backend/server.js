/**
 * mAImona Backend Server
 * Local Node.js backend for Gemini API chat integration
 */

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow all origins for local development
app.use(cors());
app.use(express.json());

// System Instruction for mAImona
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

// Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDmUbvEG5KhmkYOJ6TeJnWtvXp8JyqXbhQ";

let model = null;
let hasModel = false;

if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
  console.warn("⚠️  GEMINI_API_KEY is not set. Please set your API key.");
  hasModel = false;
} else {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    hasModel = true;
    console.log("✅ Gemini model initialized successfully");
  } catch (err) {
    console.error("❌ Failed to initialize Gemini model:", err.message);
    hasModel = false;
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

// Chat Endpoint
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
      promptText = `You are mAImona.\nHere is current market context:\n${marketContext.trim()}\n\nUser question:\n${message.trim()}`;
    } else {
      promptText = `You are mAImona.\nUser question:\n${message.trim()}`;
    }

    console.log("📩 Received request:", { message, hasContext: !!marketContext });

    const result = await model.generateContent(promptText);
    const reply = result.response.text();

    console.log("✅ Generated reply:", { length: reply.length });

    if (!reply || !reply.trim()) {
      console.error("⚠️ Empty reply from Gemini");
      return res.status(500).json({
        error: "I received an empty response from the AI service. Please try again.",
      });
    }

    return res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("❌ Error in /api/chat:", err.message || err);
    console.error("Full error:", err);
    return res.status(500).json({
      error: "I apologize, but I encountered an error processing your request. Please try again in a moment.",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 mAImona backend server started on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});