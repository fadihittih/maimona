# mAImona Backend

Secure Node.js backend for mAImona chat functionality using Google's Gemini API.

## 📋 Prerequisites

- Node.js 18.x or higher
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Environment Variable

You need to set the `GEMINI_API_KEY` environment variable before running the server.

**Option A: Set in your shell (Linux/Mac)**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

**Option B: Set in your shell (Windows CMD)**
```cmd
set GEMINI_API_KEY=your-api-key-here
```

**Option C: Set in your shell (Windows PowerShell)**
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

**Option D: Create a `.env` file (requires dotenv package)**

If you prefer using a `.env` file, you can:
1. Install dotenv: `npm install dotenv`
2. Create a `.env` file in the `backend/` directory
3. Add your key: `GEMINI_API_KEY=your-api-key-here`
4. Add `require('dotenv').config();` at the top of `server.js`

⚠️ **IMPORTANT**: Never commit your `.env` file or API key to version control!

### 3. Run the Server

```bash
node server.js
```

You should see:
```
✅ Gemini API initialized successfully
🚀 mAImona backend server started
📡 Listening on port 3000
🌐 CORS enabled for GitHub Pages and localhost
💬 Chat endpoint: POST /api/chat
🏥 Health check: GET /api/health
```

## 🔌 API Endpoints

### POST /api/chat

Main chat endpoint that processes user messages using Gemini API.

**Request:**
```json
{
  "message": "What is Bitcoin?",
  "marketContext": "BTC/USDT: $64,250.50, +2.5% (optional)"
}
```

**Response:**
```json
{
  "reply": "Bitcoin is the first decentralized cryptocurrency..."
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

### GET /api/health

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "mAImona backend is running"
}
```

## 🌐 Deployment

This backend can be deployed to any Node.js hosting platform:

### Recommended Platforms:

1. **Render** (https://render.com)
   - Free tier available
   - Easy deployment from GitHub
   - Set environment variables in dashboard

2. **Railway** (https://railway.app)
   - Simple deployment
   - Generous free tier
   - Auto-deploys from Git

3. **Fly.io** (https://fly.io)
   - Global edge deployment
   - Free tier with credit
   - Fast performance

4. **Vercel** (https://vercel.com)
   - Can use Vercel Serverless Functions
   - Need to adapt code to serverless format

### Deployment Steps (General):

1. Push this `backend/` folder to a Git repository
2. Connect your hosting platform to the repository
3. Set the `GEMINI_API_KEY` environment variable in the platform's dashboard
4. Deploy!
5. Update the frontend `MAIMONA_API_URL` with your deployed backend URL

## 🔒 Security

- ✅ API key is read from environment variables only
- ✅ CORS configured to allow only GitHub Pages origin
- ✅ Input validation on all requests
- ✅ Error messages don't expose sensitive details
- ✅ No API key ever sent to frontend

## 🛠️ Development

### Testing Locally

1. Run the server: `node server.js`
2. Test health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Test chat endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "What is Bitcoin?"}'
   ```

### CORS Configuration

The server allows requests from:
- `https://fadihittih.github.io` (GitHub Pages)
- `localhost:5500`, `localhost:8080` (local development)
- Any subdomain of `github.io`

To add more origins, edit the `allowedOrigins` array in `server.js`.

## 📦 Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `@google/generative-ai` - Official Gemini SDK

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY environment variable is not set"
- Make sure you've set the environment variable before running the server
- Check that you're running the command in the same terminal where you set the variable

### Error: "Not allowed by CORS"
- Check that your frontend is hosted on an allowed origin
- Add your origin to the `allowedOrigins` array in `server.js`

### Error: "Error processing your request"
- Check your API key is valid
- Verify you have internet connection
- Check Gemini API status

## 📝 Notes

- The server uses the `gemini-pro` model
- System instruction defines mAImona's persona and behavior
- Responses are kept concise and educational
- No trading recommendations are provided

## 📄 License

MIT
