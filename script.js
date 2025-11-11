/* ===========================
   Live Market Data from Binance
   =========================== */

// Binance API Configuration
const BINANCE_REST_API = 'https://api.binance.com/api/v3/ticker/24hr';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';

// Market data storage
let marketData = [];
let binanceWebSocket = null;
let useWebSocket = true; // Toggle for WebSocket vs REST polling

// Fallback mock data (used only if API fails)
const mockMarketData = [
    { symbol: 'BTCUSDT', price: 64250.50, change24h: -0.85, volume24h: 28500000000 },
    { symbol: 'ETHUSDT', price: 3420.75, change24h: 2.34, volume24h: 15200000000 },
    { symbol: 'BNBUSDT', price: 612.30, change24h: 1.45, volume24h: 2100000000 },
    { symbol: 'SOLUSDT', price: 145.80, change24h: -1.23, volume24h: 3800000000 },
    { symbol: 'XRPUSDT', price: 0.5234, change24h: 3.67, volume24h: 1900000000 },
    { symbol: 'ADAUSDT', price: 0.4521, change24h: -0.54, volume24h: 890000000 },
    { symbol: 'DOGEUSDT', price: 0.0823, change24h: 5.21, volume24h: 1200000000 },
    { symbol: 'MATICUSDT', price: 0.7845, change24h: 2.11, volume24h: 670000000 },
    { symbol: 'DOTUSDT', price: 6.234, change24h: -2.34, volume24h: 540000000 },
    { symbol: 'AVAXUSDT', price: 35.67, change24h: 4.23, volume24h: 780000000 }
];

const coinDescriptions = {
    'BTCUSDT': 'Bitcoin is the first decentralized cryptocurrency and the largest by market capitalization. It was created in 2009 by an unknown person or group using the name Satoshi Nakamoto.',
    'ETHUSDT': 'Ethereum is a decentralized platform that runs smart contracts and has become the foundation for decentralized finance (DeFi) and NFTs.',
    'BNBUSDT': 'Binance Coin is the native cryptocurrency of the Binance exchange, used for trading fee discounts and various utilities within the Binance ecosystem.',
    'SOLUSDT': 'Solana is a high-performance blockchain supporting fast and low-cost transactions, known for its scalability and speed.',
    'XRPUSDT': 'XRP is a digital asset designed for payments, created by Ripple Labs to enable fast and low-cost international money transfers.',
    'ADAUSDT': 'Cardano is a proof-of-stake blockchain platform founded on peer-reviewed research and developed through evidence-based methods.',
    'DOGEUSDT': 'Dogecoin started as a meme cryptocurrency but has gained significant popularity and community support.',
    'MATICUSDT': 'Polygon (formerly Matic) is a scaling solution for Ethereum, providing faster and cheaper transactions.',
    'DOTUSDT': 'Polkadot is a multi-chain platform that enables different blockchains to transfer messages and value in a trust-free fashion.',
    'AVAXUSDT': 'Avalanche is a layer one blockchain that functions as a platform for decentralized applications and custom blockchain networks.'
};

/* ===========================
   Binance API Functions
   =========================== */

/**
 * Update live data indicator status
 */
function updateLiveIndicator(status, type = 'websocket') {
    const indicator = document.getElementById('liveIndicator');
    if (!indicator) return;
    
    const textEl = indicator.querySelector('.live-text');
    
    if (status === 'connected') {
        indicator.classList.add('connected');
        textEl.textContent = type === 'websocket' ? 'Live (WebSocket)' : 'Live (REST API)';
    } else if (status === 'connecting') {
        indicator.classList.remove('connected');
        textEl.textContent = 'Connecting...';
    } else {
        indicator.classList.remove('connected');
        textEl.textContent = 'Disconnected';
    }
}

/**
 * Fetch live market data from Binance REST API
 * Filters only USDT pairs and formats the data
 */
async function fetchBinanceData() {
    try {
        console.log('🔄 Fetching live data from Binance API...');
        updateLiveIndicator('connecting');
        
        const response = await fetch(BINANCE_REST_API);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filter only USDT pairs and format data
        const usdtPairs = data
            .filter(ticker => ticker.symbol.endsWith('USDT'))
            .map(ticker => ({
                symbol: ticker.symbol,
                price: parseFloat(ticker.lastPrice),
                change24h: parseFloat(ticker.priceChangePercent),
                volume24h: parseFloat(ticker.quoteVolume) // Volume in USDT
            }))
            .filter(coin => coin.volume24h > 0) // Filter out zero volume coins
            .sort((a, b) => b.volume24h - a.volume24h); // Sort by volume
        
        console.log(`✅ Successfully fetched ${usdtPairs.length} USDT pairs`);
        updateLiveIndicator('connected', 'rest');
        return usdtPairs;
        
    } catch (error) {
        console.error('❌ Error fetching Binance data:', error);
        console.log('⚠️ Using fallback mock data');
        updateLiveIndicator('disconnected');
        return mockMarketData;
    }
}

/**
 * Initialize WebSocket connection for real-time updates
 * More efficient than polling - updates as they happen
 */
function initBinanceWebSocket() {
    try {
        console.log('🔌 Connecting to Binance WebSocket...');
        updateLiveIndicator('connecting');
        
        binanceWebSocket = new WebSocket(BINANCE_WS_URL);
        
        binanceWebSocket.onopen = () => {
            console.log('✅ WebSocket connected - receiving real-time updates');
            updateLiveIndicator('connected', 'websocket');
        };
        
        binanceWebSocket.onmessage = (event) => {
            try {
                const tickers = JSON.parse(event.data);
                
                // Filter and format USDT pairs
                const usdtPairs = tickers
                    .filter(ticker => ticker.s.endsWith('USDT'))
                    .map(ticker => ({
                        symbol: ticker.s,
                        price: parseFloat(ticker.c),
                        change24h: parseFloat(ticker.P),
                        volume24h: parseFloat(ticker.q)
                    }))
                    .filter(coin => coin.volume24h > 0)
                    .sort((a, b) => b.volume24h - a.volume24h);
                
                // Update global market data
                marketData = usdtPairs;
                
                // Update all UI components
                updateMarketSnapshot();
                updateTicker();
                updateMarketTable();
                
            } catch (error) {
                console.error('❌ Error processing WebSocket message:', error);
            }
        };
        
        binanceWebSocket.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            console.log('🔄 Falling back to REST API polling...');
            updateLiveIndicator('disconnected');
            useWebSocket = false;
            startRESTPolling();
        };
        
        binanceWebSocket.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            updateLiveIndicator('disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (useWebSocket) {
                    console.log('🔄 Attempting to reconnect WebSocket...');
                    initBinanceWebSocket();
                }
            }, 5000);
        };
        
    } catch (error) {
        console.error('❌ Error initializing WebSocket:', error);
        updateLiveIndicator('disconnected');
        useWebSocket = false;
        startRESTPolling();
    }
}

/**
 * Start REST API polling (fallback if WebSocket fails)
 * Updates every 15 seconds
 */
function startRESTPolling() {
    console.log('🔄 Starting REST API polling (15s interval)...');
    
    // Initial fetch
    fetchBinanceData().then(data => {
        marketData = data;
        updateMarketSnapshot();
        updateTicker();
        updateMarketTable();
    });
    
    // Poll every 15 seconds
    setInterval(async () => {
        const data = await fetchBinanceData();
        marketData = data;
        updateMarketSnapshot();
        updateTicker();
        updateMarketTable();
    }, 15000);
}

/* ===========================
   State Management
   =========================== */

let currentFilter = 'volume';
let currentCoin = null;

/* ===========================
   Theme Management
   =========================== */

const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggle.querySelector('.theme-icon').textContent = '☀️';
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggle.querySelector('.theme-icon').textContent = '🌙';
    }
});

/* ===========================
   Navigation & Scroll
   =========================== */

function scrollToChat() {
    document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
}

/* ===========================
   Chat Functionality
   =========================== */

// Backend API URL - CONFIGURE THIS AFTER DEPLOYMENT
// Replace with your deployed backend URL (e.g., https://your-backend.onrender.com/api/chat)
const MAIMONA_API_URL = "https://YOUR-BACKEND-DOMAIN/api/chat";

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Prepare market context (optional - include current top coins data)
        const marketContext = prepareMarketContext();
        
        // Call backend API
        const response = await fetch(MAIMONA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                marketContext: marketContext
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        hideTypingIndicator();
        
        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else if (data.error) {
            addMessage(data.error, 'bot');
        } else {
            addMessage('I received an unexpected response. Please try again.', 'bot');
        }
        
    } catch (error) {
        console.error('Error calling mAImona API:', error);
        hideTypingIndicator();
        
        // Fallback to local response if API fails
        const fallbackResponse = generateFallbackResponse(message);
        addMessage(fallbackResponse, 'bot');
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

/**
 * Prepare market context to send with the chat request
 * Includes current top coins and their data
 */
function prepareMarketContext() {
    if (!marketData || marketData.length === 0) {
        return null;
    }
    
    const topCoins = marketData.slice(0, 10);
    const contextLines = topCoins.map(coin => 
        `${formatSymbol(coin.symbol)}: $${formatNumber(coin.price)}, ${coin.change24h > 0 ? '+' : ''}${coin.change24h.toFixed(2)}%, Vol: $${formatVolume(coin.volume24h)}`
    );
    
    return `Current Top 10 Coins by Volume:\n${contextLines.join('\n')}`;
}

/**
 * Fallback response generator (used when backend is unavailable)
 * Provides basic responses using local market data
 */
function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords with live data
    if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
        const btcData = marketData.find(c => c.symbol === 'BTCUSDT');
        if (btcData) {
            return `Based on current live data, BTC/USDT is trading at $${formatNumber(btcData.price)}, showing a ${btcData.change24h > 0 ? 'gain' : 'decline'} of ${btcData.change24h > 0 ? '+' : ''}${btcData.change24h.toFixed(2)}% in the last 24 hours. The trading volume stands at $${formatVolume(btcData.volume24h)}.`;
        }
    } else if (lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) {
        const ethData = marketData.find(c => c.symbol === 'ETHUSDT');
        if (ethData) {
            return `ETH/USDT is currently priced at $${formatNumber(ethData.price)}, ${ethData.change24h > 0 ? 'up' : 'down'} ${ethData.change24h > 0 ? '+' : ''}${ethData.change24h.toFixed(2)}% in the last 24 hours.`;
        }
    } else if (lowerMessage.includes('top') && (lowerMessage.includes('coin') || lowerMessage.includes('traded'))) {
        if (marketData.length >= 3) {
            const top3 = marketData.slice(0, 3);
            return `The top 3 most traded coins by 24h volume are: 1) ${formatSymbol(top3[0].symbol)} ($${formatVolume(top3[0].volume24h)}), 2) ${formatSymbol(top3[1].symbol)} ($${formatVolume(top3[1].volume24h)}), and 3) ${formatSymbol(top3[2].symbol)} ($${formatVolume(top3[2].volume24h)}).`;
        }
    }
    
    return 'I apologize, but I\'m having trouble connecting to my AI service at the moment. Please check that the backend is properly configured and try again. In the meantime, you can explore the live market data in the table below.';
}

function sendSuggestion(text) {
    chatInput.value = text;
    sendMessage();
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textP = document.createElement('p');
    textP.textContent = text;
    
    contentDiv.appendChild(textP);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-bot';
    typingDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    contentDiv.appendChild(indicatorDiv);
    typingDiv.appendChild(contentDiv);
    chatMessages.appendChild(typingDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function extractCoinFromMessage(message) {
    // Common coin symbols to check
    const commonCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'AVAX'];
    
    for (const coin of commonCoins) {
        if (message.includes(coin.toLowerCase())) {
            return coin + 'USDT';
        }
    }
    
    // Check against all market data
    for (const coinData of marketData) {
        const baseSymbol = coinData.symbol.replace('USDT', '');
        if (message.includes(baseSymbol.toLowerCase()) || 
            message.includes(coinData.symbol.toLowerCase())) {
            return coinData.symbol;
        }
    }
    return null;
}

/**
 * Format symbol for display (BTCUSDT -> BTC/USDT)
 */
function formatSymbol(symbol) {
    return symbol.replace('USDT', '/USDT');
}

/* ===========================
   Market Snapshot Sidebar
   =========================== */

function updateMarketSnapshot() {
    const snapshot = document.getElementById('marketSnapshot');
    if (!snapshot) return;
    
    snapshot.innerHTML = '';
    
    // Show top 5 coins by volume
    const topCoins = marketData.slice(0, 5);
    
    if (topCoins.length === 0) {
        snapshot.innerHTML = '<p style="opacity: 0.7; padding: 1rem;">Loading market data...</p>';
        return;
    }
    
    topCoins.forEach(coin => {
        const card = document.createElement('div');
        card.className = 'snapshot-card';
        card.onclick = () => openCoinModal(coin.symbol);
        
        const changeClass = coin.change24h >= 0 ? 'positive' : 'negative';
        
        card.innerHTML = `
            <div class="snapshot-symbol">${formatSymbol(coin.symbol)}</div>
            <div class="snapshot-price">$${formatNumber(coin.price)}</div>
            <div class="snapshot-change ${changeClass}">${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%</div>
        `;
        
        snapshot.appendChild(card);
    });
}

/* ===========================
   Ticker
   =========================== */

function updateTicker() {
    const ticker = document.getElementById('ticker');
    if (!ticker) return;
    
    if (marketData.length === 0) {
        ticker.innerHTML = '<span style="opacity: 0.7;">Loading live data...</span>';
        return;
    }
    
    // Show top 20 coins, duplicated for seamless loop
    const topCoins = marketData.slice(0, 20);
    const tickerData = [...topCoins, ...topCoins];
    
    ticker.innerHTML = tickerData.map(coin => {
        const changeClass = coin.change24h >= 0 ? 'positive' : 'negative';
        return `
            <div class="ticker-item">
                <strong>${formatSymbol(coin.symbol)}</strong>
                <span>$${formatNumber(coin.price)}</span>
                <span class="${changeClass}">${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%</span>
            </div>
        `;
    }).join('');
}

/* ===========================
   Market Table
   =========================== */

function updateMarketTable() {
    const tbody = document.getElementById('marketTableBody');
    if (!tbody) return;
    
    if (marketData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; opacity: 0.7;">Loading live market data from Binance...</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    let sortedData = [...marketData];
    
    // Sort based on current filter
    if (currentFilter === 'volume') {
        sortedData.sort((a, b) => b.volume24h - a.volume24h);
    } else if (currentFilter === 'gainers') {
        sortedData.sort((a, b) => b.change24h - a.change24h);
    } else if (currentFilter === 'losers') {
        sortedData.sort((a, b) => a.change24h - b.change24h);
    }
    
    // Show top 50 coins
    const displayData = sortedData.slice(0, 50);
    
    displayData.forEach(coin => {
        const row = document.createElement('tr');
        row.onclick = () => openCoinModal(coin.symbol);
        
        const changeClass = coin.change24h >= 0 ? 'positive' : 'negative';
        
        row.innerHTML = `
            <td class="symbol-cell">${formatSymbol(coin.symbol)}</td>
            <td class="price-cell">$${formatNumber(coin.price)}</td>
            <td class="change-cell ${changeClass}">${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%</td>
            <td>$${formatVolume(coin.volume24h)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function filterMarket(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateMarketTable();
}

/* ===========================
   Coin Modal
   =========================== */

function openCoinModal(symbol) {
    const modal = document.getElementById('coinModal');
    const coin = marketData.find(c => c.symbol === symbol);
    
    if (!coin) {
        console.log('Coin not found:', symbol);
        return;
    }
    
    currentCoin = coin;
    
    // Update header
    const header = document.getElementById('coinHeader');
    const changeClass = coin.change24h >= 0 ? 'positive' : 'negative';
    
    header.innerHTML = `
        <h2 class="coin-name">${formatSymbol(coin.symbol)}</h2>
        <div class="coin-stats">
            <div class="coin-stat">
                <div class="coin-stat-label">Price</div>
                <div class="coin-stat-value">$${formatNumber(coin.price)}</div>
            </div>
            <div class="coin-stat">
                <div class="coin-stat-label">24h Change</div>
                <div class="coin-stat-value ${changeClass}">${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%</div>
            </div>
            <div class="coin-stat">
                <div class="coin-stat-label">24h Volume</div>
                <div class="coin-stat-value">$${formatVolume(coin.volume24h)}</div>
            </div>
        </div>
    `;
    
    // Update AI summary
    const summary = document.getElementById('coinAiSummary');
    summary.textContent = `Based on live Binance data, ${formatSymbol(symbol)} is trading at $${formatNumber(coin.price)}, showing a ${coin.change24h >= 0 ? 'gain' : 'decline'} of ${Math.abs(coin.change24h).toFixed(2)}% in the last 24 hours. The trading volume of $${formatVolume(coin.volume24h)} indicates ${coin.volume24h > 5000000000 ? 'very high' : coin.volume24h > 1000000000 ? 'high' : 'moderate'} market activity. This is live market data for informational purposes only, not investment advice.`;
    
    // Update coin info
    const info = document.getElementById('coinInfo');
    info.textContent = coinDescriptions[symbol] || 'Information about this cryptocurrency.';
    
    // Draw chart
    drawCoinChart();
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCoinModal() {
    const modal = document.getElementById('coinModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function drawCoinChart() {
    const canvas = document.getElementById('coinChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    // Generate mock price data for the last 24 hours
    const dataPoints = 24;
    const basePrice = currentCoin.price;
    const volatility = basePrice * 0.02; // 2% volatility
    
    const prices = [];
    for (let i = 0; i < dataPoints; i++) {
        const randomChange = (Math.random() - 0.5) * volatility;
        prices.push(basePrice + randomChange);
    }
    
    // Calculate drawing parameters
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Get theme colors
    const isDark = document.body.classList.contains('dark-theme');
    const lineColor = '#00BFA6';
    const textColor = isDark ? '#E5E7EB' : '#1E293B';
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Draw price line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    prices.forEach((price, i) => {
        const x = padding + (width / (dataPoints - 1)) * i;
        const y = padding + height - ((price - minPrice) / priceRange) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = textColor;
    ctx.font = '12px Inter';
    ctx.textAlign = 'right';
    
    // Y-axis labels (prices)
    for (let i = 0; i <= 4; i++) {
        const price = minPrice + (priceRange / 4) * (4 - i);
        const y = padding + (height / 4) * i;
        ctx.fillText('$' + price.toFixed(2), padding - 10, y + 4);
    }
    
    // X-axis labels (time)
    ctx.textAlign = 'center';
    [0, 6, 12, 18, 24].forEach(hour => {
        const x = padding + (width / 24) * hour;
        ctx.fillText(hour + 'h', x, canvas.height - 20);
    });
}

/* ===========================
   FAQ Functionality
   =========================== */

function toggleFaq(index) {
    const items = document.querySelectorAll('.faq-item');
    const item = items[index];
    
    // Toggle active class
    if (item.classList.contains('active')) {
        item.classList.remove('active');
    } else {
        // Close all other FAQs
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }
}

/* ===========================
   Utility Functions
   =========================== */

function formatNumber(num) {
    if (num >= 1) {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return num.toFixed(4);
    }
}

function formatVolume(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else {
        return num.toFixed(0);
    }
}

/* ===========================
   Initialization
   =========================== */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing mAImona with live Binance data...');
    
    // Try WebSocket first for real-time updates
    if (useWebSocket) {
        initBinanceWebSocket();
        
        // Also fetch initial data via REST API while WebSocket connects
        try {
            const data = await fetchBinanceData();
            marketData = data;
            updateMarketSnapshot();
            updateTicker();
            updateMarketTable();
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    } else {
        // Use REST API polling if WebSocket is disabled
        startRESTPolling();
    }
    
    console.log('✨ mAImona initialized successfully!');
    console.log('💡 Market data updates:', useWebSocket ? 'Real-time via WebSocket' : 'Every 15s via REST API');
});

/* ===========================
   Close modal on escape key
   =========================== */

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCoinModal();
    }
});
