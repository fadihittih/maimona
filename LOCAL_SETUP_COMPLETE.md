# ✅ mAImona - Local Setup Complete

Your mAImona project is now configured to run **100% locally** with Gemini-powered chat!

## 🎯 What Changed

### 1. Backend (`/backend/server.js`)
- ✅ API key: `const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";`
- ✅ Graceful handling when key is missing or placeholder
- ✅ CORS: Allows all origins (perfect for local dev)
- ✅ Uses `gemini-1.5-flash` model
- ✅ Endpoints: `/api/health` and `/api/chat`
- ✅ Runs on `http://localhost:3000`

### 2. Frontend (`script.js`)
- ✅ API URL: `const MAIMONA_API_URL = "http://localhost:3000/api/chat";`
- ✅ Sends messages with live Binance market context
- ✅ Handles responses and errors gracefully
- ✅ Falls back to local responses if backend unavailable

### 3. Documentation (`backend/README.md`)
- ✅ Updated for local development
- ✅ Clear instructions for setting API key
- ✅ Testing examples with curl
- ✅ Troubleshooting guide

## 🚀 How to Run

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Your Gemini API Key

**Option A: Edit server.js (Easiest)**
1. Open `backend/server.js`
2. Find line 35: `const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";`
3. Replace `YOUR_GEMINI_API_KEY` with your actual key
4. Save the file

**Option B: Use Environment Variable**
```bash
GEMINI_API_KEY=your_actual_key_here node server.js
```

### Step 3: Start the Backend
```bash
cd backend
node server.js
```

You should see:
```
✅ Gemini model initialized successfully
🚀 mAImona backend server started on port 3000
📡 Health check: http://localhost:3000/api/health
💬 Chat endpoint: http://localhost:3000/api/chat
```

### Step 4: Open the Frontend
Open `index.html` in your browser using:
- **Live Server extension** in VS Code (right-click → Open with Live Server)
- **OR** any simple HTTP server:
  ```bash
  # Python 3
  python3 -m http.server 8080
  
  # Node.js (if you have http-server installed)
  npx http-server -p 8080
  ```

### Step 5: Test the Chat!
1. Open the website in your browser
2. Click on the chat interface
3. Type a question like "What is Bitcoin?"
4. Watch mAImona respond with real Gemini AI! 🎉

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "hasModel": true,
  "message": "mAImona backend is running"
}
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Ethereum?"}'
```

## 📁 Project Structure

```
maimona/
├── index.html              # Main website (open this in browser)
├── styles.css              # All styling
├── script.js               # Frontend logic + Binance data
│                            # MAIMONA_API_URL = "http://localhost:3000/api/chat"
└── backend/
    ├── package.json        # Dependencies
    ├── server.js           # Express + Gemini API
    │                        # GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
    └── README.md           # Backend docs
```

## 🔑 Important Notes

### Security
- ⚠️ **Never commit your API key to Git!**
- The placeholder `YOUR_GEMINI_API_KEY` is safe in Git
- Replace it locally, or use environment variables

### API Key
Get your free Gemini API key here:
👉 https://makersuite.google.com/app/apikey

### Ports
- Backend: `http://localhost:3000`
- Frontend: Any port (e.g., `http://localhost:8080` with Live Server)

### Features
- ✅ Live Binance crypto prices via WebSocket
- ✅ AI-powered chat with market context
- ✅ Light/dark theme toggle
- ✅ Responsive design
- ✅ Real-time market table with filters

## 🐛 Troubleshooting

### "GEMINI_API_KEY is not set or is placeholder"
→ Edit `backend/server.js` and replace `YOUR_GEMINI_API_KEY` with your key

### "Cannot find module 'express'"
→ Run `npm install` in the `backend/` directory

### "Address already in use"
→ Port 3000 is taken. Stop other services or change PORT in server.js

### Frontend can't connect to backend
→ Make sure backend is running on port 3000
→ Check browser console for CORS errors
→ Verify `MAIMONA_API_URL` in script.js is `http://localhost:3000/api/chat`

### Chat shows fallback responses
→ Backend might not be running
→ Check if API key is set correctly
→ Look at backend terminal for errors

## ✅ Git Status

All changes committed with message:
```
"Switch mAImona to local Gemini-backed chat"
```

Files modified:
- `backend/package.json`
- `backend/server.js`
- `backend/README.md`
- `script.js`

## 🎉 You're All Set!

Your mAImona project is now fully local and ready to run with real Gemini AI!

**Next Steps:**
1. Get your Gemini API key
2. Set it in `backend/server.js`
3. Run `cd backend && npm install && node server.js`
4. Open `index.html` in your browser
5. Chat with mAImona! 🚀

---

**No Render. No Vercel. No remote dependencies. Just pure local dev magic!** ✨
