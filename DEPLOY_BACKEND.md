# Deploy mAImona Backend to Render

This guide will help you deploy the mAImona backend to Render for free.

## Prerequisites

- A GitHub account (you already have this)
- A Render account (free signup at https://render.com)
- Your Gemini API key from https://makersuite.google.com/app/apikey

## Step 1: Sign Up for Render

1. Go to https://render.com
2. Click **Sign Up** or **Get Started**
3. Choose **Sign in with GitHub**
4. Authorize Render to access your repositories

## Step 2: Create a New Web Service

1. From your Render dashboard, click **New +** button
2. Select **Web Service**
3. Connect your GitHub repository:
   - If this is your first time, click **Connect account** and authorize Render
   - Find and select your `fadihittih/maimona` repository
   - Click **Connect**

## Step 3: Configure Your Service

Fill in the following details:

### Basic Settings:
- **Name**: `maimona` (or `maimona-backend`)
- **Region**: Choose the closest region to you (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`

### Build & Deploy Settings:
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### Instance Type:
- Select **Free** plan (this is perfect for MVP)

## Step 4: Add Environment Variables

This is the **most important step**!

1. Scroll down to **Environment Variables** section
2. Click **Add Environment Variable**
3. Add your Gemini API key:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Paste your Gemini API key here (e.g., `AIza...`)
4. Click **Add**

⚠️ **IMPORTANT**: 
- Never share your API key publicly
- Never commit it to GitHub
- Keep it only in Render's environment variables

## Step 5: Deploy!

1. Click **Create Web Service** at the bottom
2. Render will start building and deploying your backend
3. Wait for the deployment to complete (usually 2-3 minutes)
4. You'll see logs like:
   ```
   ✅ Gemini model initialized
   🚀 mAImona backend server started on port 10000
   ```

## Step 6: Get Your Backend URL

Once deployed, Render will give you a URL like:
```
https://maimona.onrender.com
```

Your endpoints will be:
- Health check: `https://maimona.onrender.com/api/health`
- Chat: `https://maimona.onrender.com/api/chat`

## Step 7: Test Your Backend

Open a new terminal and test your backend:

### Test Health Endpoint:
```bash
curl https://maimona.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "hasModel": true,
  "message": "mAImona backend is running"
}
```

### Test Chat Endpoint:
```bash
curl -X POST https://maimona.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Bitcoin?"}'
```

You should get a response from mAImona!

## Step 8: Update Frontend (Optional)

If your deployed URL is different from `https://maimona.onrender.com`, update `script.js`:

1. Open `script.js`
2. Find line 245:
   ```javascript
   const MAIMONA_API_URL = "https://maimona.onrender.com/api/chat";
   ```
3. Replace with your actual Render URL
4. Commit and push:
   ```bash
   git add script.js
   git commit -m "Update backend URL to deployed Render service"
   git push origin main
   ```

## Important Notes

### Free Plan Limitations:
- ✅ Perfect for MVP and testing
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after inactivity may take 30-60 seconds (cold start)
- ✅ 750 hours/month free (enough for 24/7 running)

### Keeping Your Service Awake:
If you want faster response times, you can:
1. Upgrade to paid plan ($7/month) for always-on service
2. Use a service like UptimeRobot to ping your backend every 10 minutes
3. Accept the cold start delay for free tier

## Troubleshooting

### Issue: "Application failed to start"
- Check logs in Render dashboard
- Verify `Root Directory` is set to `backend`
- Verify `Start Command` is `node server.js`

### Issue: "GEMINI_API_KEY is not set"
- Go to your service's **Environment** tab
- Verify the environment variable is added
- Click **Manual Deploy** > **Clear build cache & deploy**

### Issue: "Not allowed by CORS"
- The backend now allows all origins for demo purposes
- If you need to restrict origins, edit `backend/server.js`

### Issue: Health check shows `"hasModel": false`
- Your Gemini API key is invalid or missing
- Go to Environment tab and verify `GEMINI_API_KEY`
- Get a new key from https://makersuite.google.com/app/apikey

## Next Steps

1. ✅ Backend is deployed and running
2. ✅ Frontend connects to your backend automatically
3. ✅ Users can chat with mAImona using real Gemini AI!

## Monitoring

Check your backend health anytime:
```bash
curl https://maimona.onrender.com/api/health
```

View logs in real-time:
1. Go to your Render dashboard
2. Click on your `maimona` service
3. Click **Logs** tab
4. Watch live requests and responses

---

**Congratulations! 🎉**

Your mAImona backend is now live and ready to power intelligent crypto conversations!

**Live Demo**: https://fadihittih.github.io/maimona/  
**Backend API**: https://maimona.onrender.com
