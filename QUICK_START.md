# ⚡ Quick Start Guide - mAImona Live Data

## 🎯 Just Want to See It Work?

1. **Open** `index.html` in your browser
2. **Watch** the live indicator turn green: 🟢 "Live (WebSocket)"
3. **See** real prices updating automatically
4. **Done!** You're viewing live Binance data

---

## 🔍 How to Verify It's Live

### Method 1: Visual Check
- Look for the **live indicator** next to "Market Overview"
- Should show: 🟢 **"Live (WebSocket)"** or 🟢 **"Live (REST API)"**
- Prices should be updating in real-time

### Method 2: Browser Console
1. Press **F12** (or right-click → Inspect)
2. Click **Console** tab
3. Look for these messages:
```
✅ WebSocket connected - receiving real-time updates
✅ Successfully fetched XXX USDT pairs
```

### Method 3: Compare with Binance
1. Open [Binance.com](https://www.binance.com/en/markets/overview)
2. Compare BTC/USDT price
3. Should match exactly! 🎯

---

## 📊 What Data is Live?

### ✅ Live (Real-time)
- All coin prices
- 24h change percentages
- 24h trading volumes
- Market table sorting
- Top coins snapshot
- Ticker scrolling

### ⚠️ Not Yet Live
- Historical price charts (still using mock data)
- Coin descriptions (static text)

---

## 🎮 Interactive Features

### Try These:

1. **Filter Markets**
   - Click "Top Volume" → See highest volume coins
   - Click "Top Gainers" → See biggest price increases
   - Click "Top Losers" → See biggest price decreases

2. **View Coin Details**
   - Click any coin in the table
   - See detailed stats in modal
   - View AI-generated summary

3. **Ask the AI**
   - Scroll to chat section
   - Try: "Analyze BTC/USDT in the last 24h"
   - Get live data analysis!

4. **Watch Live Updates**
   - Keep table open
   - Watch prices change in real-time
   - Notice green/red color changes

---

## 🔧 Troubleshooting

### Problem: "Connecting..." won't change

**Solution:**
- Check internet connection
- Refresh the page (Cmd/Ctrl + R)
- Check browser console for errors

### Problem: Shows "Disconnected"

**Solution:**
- Binance API might be temporarily unavailable
- Using fallback mock data
- Wait 5 seconds for auto-reconnect attempt

### Problem: Prices not updating

**Solution:**
1. Check live indicator status
2. If "Live (REST API)" → updates every 15s (slower)
3. If "Live (WebSocket)" → should be real-time
4. Refresh page if stuck

### Problem: WebSocket won't connect

**Solution:**
- Some networks block WebSocket
- System automatically falls back to REST API
- Still gets live data, just updates every 15s instead

---

## 💡 Pro Tips

### 1. **Watch the Console**
Open browser console (F12) to see:
- Connection status
- Data fetch logs
- Error messages (if any)
- Performance metrics

### 2. **Test Failover**
1. Disconnect internet
2. See indicator change to "Disconnected"
3. Reconnect internet
4. Watch auto-recovery!

### 3. **Compare Filter Results**
- **Top Volume**: Most traded coins (liquidity leaders)
- **Top Gainers**: Best performers (highest % gain)
- **Top Losers**: Worst performers (highest % loss)

### 4. **Use Quick Prompts**
Click the suggestion chips in chat:
- "Analyze BTC/USDT in the last 24h."
- "Top 3 traded coins today."
- "Explain Funding Rate in simple terms."

---

## 📱 Mobile Usage

Works perfectly on mobile:
- Responsive table
- Touch-friendly buttons
- Optimized layout
- Same live data!

---

## 🎨 Customize Appearance

### Toggle Theme
- Click 🌙/☀️ icon (top-right)
- Switches between dark/light mode
- Preference saved automatically

### Scroll Behavior
- Click nav links for smooth scroll
- "Try Demo" button → jumps to chat
- All sections accessible

---

## 📈 Data Refresh Rates

| Feature | Update Rate |
|---------|-------------|
| WebSocket Stream | **Real-time** (1-2s) |
| REST API Polling | **Every 15 seconds** |
| Market Snapshot | Same as source |
| Ticker | Same as source |
| Market Table | Same as source |

---

## 🔐 Privacy & Security

### What's Collected?
- **Nothing!** No tracking, no cookies, no data collection

### What's Sent?
- API requests to Binance (public data only)
- No personal information
- No API keys required

### Is it Safe?
- ✅ Read-only access
- ✅ No login required
- ✅ No trading capabilities
- ✅ Open source code

---

## 🆘 Need Help?

### Common Questions

**Q: Why do I see "Loading market data..."?**  
A: Initial data fetch in progress. Should appear within 2-3 seconds.

**Q: Can I trade from this website?**  
A: No! This is information only. Use Binance.com for trading.

**Q: Is this financial advice?**  
A: Absolutely not. Educational tool only.

**Q: How accurate is the data?**  
A: 100% accurate - comes directly from Binance API.

**Q: Can I add my favorite coins?**  
A: Currently shows top 50 by volume. Watchlist feature coming soon!

---

## 🎓 Learn More

- **Full Documentation**: See [README.md](README.md)
- **Technical Details**: See [LIVE_DATA_UPDATE.md](LIVE_DATA_UPDATE.md)
- **Binance API Docs**: https://binance-docs.github.io/apidocs/

---

## ✅ Quick Checklist

- [ ] Website opened in browser
- [ ] Live indicator shows "Live"
- [ ] Prices are updating
- [ ] Can filter by Volume/Gainers/Losers
- [ ] Can click coins for details
- [ ] Chat gives live data responses
- [ ] Theme toggle works
- [ ] Mobile responsive (if on mobile)

**All checked? You're ready to explore! 🚀**

---

**Last Updated:** November 11, 2025  
**Status:** 🟢 Live and Running!
