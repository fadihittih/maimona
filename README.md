# mAImona - AI-Powered Trading Assistant

![mAImona Logo](https://via.placeholder.com/150x50/00BFA6/FFFFFF?text=mAImona)

An intelligent trading assistant that connects live market data with AI to deliver clear, unbiased insights about cryptocurrency markets.

## 🚀 Features

- **Interactive Chat Interface**: Ask questions about market prices, volumes, indicators, and crypto concepts
- **Real-time Market Data**: 🔴 **LIVE** data from Binance API via WebSocket and REST
- **Coin Details**: Detailed view with price charts and AI-generated summaries
- **Light/Dark Theme**: Beautiful theme switching with smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Educational Focus**: Provides information without making trading recommendations
- **WebSocket Streaming**: Real-time price updates (no delay!)
- **Auto-Refresh**: Fallback to 15-second REST API polling if WebSocket fails
- **Status Indicator**: Visual feedback showing connection status

## 🎨 Design Philosophy

- **Modern & Minimal**: Clean interface with focus on usability
- **Fintech Aesthetic**: Professional design suitable for financial applications
- **Calm & Intelligent**: Colors and animations that reduce cognitive load
- **Accessible**: High contrast ratios and readable typography

## 🎯 Quick Start

1. **Open the website**
   - Simply open `index.html` in your web browser
   - No build process or server required!

2. **Try the demo**
   - Click "Try the Demo" button on the hero section
   - Ask questions in the chat interface
   - Click on coins in the market table for detailed views

3. **Explore features**
   - Toggle between light/dark themes
   - Filter market data by volume, gainers, or losers
   - Read the FAQ section for more information

## 📁 Project Structure

```
mAImona/
│
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and theme system
├── script.js           # All JavaScript functionality
├── chart.min.js        # Chart rendering (placeholder)
└── README.md           # This file
```

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: No framework dependencies
- **Canvas API**: Custom chart rendering
- **Binance API**: Live cryptocurrency market data
- **WebSocket**: Real-time data streaming
- **REST API**: Fallback polling mechanism

## 🎨 Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary | `#00BFA6` | Main brand color, highlights |
| Accent | `#FFD369` | Secondary highlights |
| Dark BG | `#0E1117` | Dark theme background |
| Light BG | `#F8FAFC` | Light theme background |
| Dark Text | `#E5E7EB` | Text on dark background |
| Light Text | `#1E293B` | Text on light background |

## 📝 Typography

- **Primary Font**: Inter (English)
- **Arabic Font**: Cairo (Arabic support)
- **Border Radius**: 10px (consistent across all elements)
- **Transitions**: 0.3s ease (smooth interactions)

## 🔌 API Integration

### ✅ **NOW LIVE!** Connected to Binance API

The website now displays **real-time cryptocurrency data** from Binance:

#### Data Sources:
1. **WebSocket Stream (Primary)**: `wss://stream.binance.com:9443/ws/!ticker@arr`
   - Real-time updates as they happen
   - Most efficient method
   - Auto-reconnects on disconnect

2. **REST API (Fallback)**: `https://api.binance.com/api/v3/ticker/24hr`
   - Updates every 15 seconds
   - Activates if WebSocket fails
   - No API key required

#### Features:
- ✅ Live prices for all USDT pairs
- ✅ Real-time 24h change percentages
- ✅ Live trading volumes
- ✅ Automatic failover system
- ✅ Visual connection status indicator
- ✅ Error handling with fallback to mock data

#### Data Flow:
```
Binance API → Filter USDT pairs → Sort by volume → Update UI
     ↓
WebSocket (real-time) or REST (15s polling)
     ↓
Market Table, Snapshot, Ticker, Chat AI
```

See [LIVE_DATA_UPDATE.md](LIVE_DATA_UPDATE.md) for detailed technical documentation.

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (Full layout with sidebar)
- **Tablet**: 768px - 1024px (Stacked layout)
- **Mobile**: < 768px (Simplified navigation and tables)

## 🎭 Theme System

The website supports both light and dark themes:

- **Dark Theme** (default): Optimized for low-light environments
- **Light Theme**: Clean and bright for daytime use
- **Toggle**: Located in the top-right corner of the header

Themes are implemented using CSS custom properties for instant switching.

## 💬 Chat Suggestions

Pre-built queries users can try:
- "Analyze BTC/USDT in the last 24h."
- "Top 3 traded coins today."
- "Explain Funding Rate in simple terms."

## 🔍 Market Features

### Market Overview Table
- Sortable by: Volume, Gainers, Losers
- Real-time price updates (simulated every 10s)
- Click any coin for detailed view

### Coin Detail Modal
- Price chart (24-hour view)
- AI-generated summary
- Key statistics (price, change, volume)
- Coin description

## ⚠️ Disclaimers

- **Not Financial Advice**: mAImona is for educational purposes only
- **Demo Version**: Uses simulated data for demonstration
- **No Trading**: Does not execute trades or access trading accounts

## 🚧 Future Enhancements

### ~~Phase 1 (MVP - Current)~~ ✅ COMPLETED
- ✅ Static website with mock data
- ✅ Chat interface
- ✅ Market overview
- ✅ Theme system

### ~~Phase 2 (API Integration)~~ ✅ COMPLETED
- ✅ Connect to Binance API
- ✅ Real-time WebSocket data
- ✅ Live market updates
- [ ] AI-powered chat backend (in progress)
- [ ] Multi-language support (Arabic)

### Phase 3 (Advanced Features)
- [ ] Historical price charts (real data)
- [ ] Technical indicators (RSI, MACD, etc.)
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Advanced charting with TradingView

## 🔧 Customization

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #00BFA6;    /* Your primary color */
    --accent: #FFD369;     /* Your accent color */
    /* ... other variables */
}
```

### Adding New Coins

Add to `mockMarketData` array in `script.js`:

```javascript
const mockMarketData = [
    // ... existing coins
    { 
        symbol: 'NEW/USDT', 
        price: 1.23, 
        change24h: 4.56, 
        volume24h: 1000000 
    }
];
```

### Customizing AI Responses

Edit `aiResponses` object in `script.js`:

```javascript
const aiResponses = {
    'keyword': 'Your custom response here...',
    // ... other responses
};
```

## 📄 License

This project is created as an experimental demo. Feel free to use and modify for your own projects.

## 🤝 Contributing

This is a demo project, but suggestions and improvements are welcome!

## 📧 Contact

For questions or feedback about mAImona, please reach out through the Contact link in the footer.

---

**mAImona** - An experimental information tool, not financial advice.

Built with ❤️ for traders and crypto enthusiasts.
