/**
 * mAImona Backend Server
 * Secure Node.js backend for Gemini API chat integration
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS configuration - allow GitHub Pages and localhost for development
const allowedOrigins = [
  'https://fadihittih.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// System instruction for mAImona
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

// Initialize Gemini API
let genAI = null;
let model = null;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY environment variable is not set');
    console.error('Please set GEMINI_API_KEY before starting the server');
    process.exit(1);
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    systemInstruction: SYSTEM_INSTRUCTION
  });
  
  console.log('✅ Gemini API initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Gemini API:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'mAImona backend is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, marketContext } = req.body;
    
    // Validate request
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: message is required and must be a non-empty string' 
      });
    }
    
    // Prepare the prompt with optional market context
    let fullPrompt = message;
    
    if (marketContext && typeof marketContext === 'string' && marketContext.trim().length > 0) {
      fullPrompt = `Market Context:\n${marketContext}\n\nUser Question: ${message}`;
    }
    
    console.log('📩 Received chat request:', { 
      messageLength: message.length, 
      hasMarketContext: !!marketContext 
    });
    
    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const reply = response.text();
    
    console.log('✅ Generated response:', { replyLength: reply.length });
    
    // Return the response
    res.json({ reply });
    
  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    
    // Send a safe error response
    res.status(500).json({ 
      error: 'I apologize, but I encountered an error processing your request. Please try again in a moment.' 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 mAImona backend server started');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 CORS enabled for GitHub Pages and localhost`);
  console.log(`💬 Chat endpoint: POST /api/chat`);
  console.log(`🏥 Health check: GET /api/health`);
});
