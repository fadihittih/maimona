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

// Coin name aliases for flexible search
const coinAliases = {
    'bitcoin': ['btc', 'بيتكوين', 'بتكوين'],
    'ethereum': ['eth', 'ايثريوم', 'إيثيريوم'],
    'binance': ['bnb', 'بينانس'],
    'solana': ['sol', 'سولانا'],
    'ripple': ['xrp', 'ريبل'],
    'cardano': ['ada', 'كاردانو'],
    'dogecoin': ['doge', 'دوج', 'دوجكوين'],
    'polygon': ['matic', 'بوليجون', 'ماتيك'],
    'polkadot': ['dot', 'بولكادوت'],
    'avalanche': ['avax', 'افالانش'],
    'chainlink': ['link', 'تشين لينك'],
    'uniswap': ['uni', 'يونيسواب'],
    'litecoin': ['ltc', 'لايتكوين'],
    'stellar': ['xlm', 'ستيلار'],
    'cosmos': ['atom', 'كوزموس'],
    'tron': ['trx', 'ترون'],
    'shiba': ['shib', 'شيبا'],
    'near': ['near', 'نير'],
    'aptos': ['apt', 'ابتوس'],
    'arbitrum': ['arb', 'اربتروم']
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

// Backend API URL - Auto-detect environment
const MAIMONA_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3001/api/chat"  // Local development
    : null;  // GitHub Pages - use fallback responses

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
    
    // Hide suggestion chips after first message
    const suggestionChips = document.querySelector('.chat-suggestions');
    if (suggestionChips) {
        suggestionChips.style.display = 'none';
    }
    
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
        
        // Check if backend is available
        if (!MAIMONA_API_URL) {
            // No backend - use smart fallback
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking
            hideTypingIndicator();
            const fallbackResponse = generateFallbackResponse(message);
            addMessage(fallbackResponse, 'bot');
            return;
        }
        
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
 * Smart coin finder - supports symbols, full names, and aliases
 */
function findCoin(query) {
    const lowerQuery = query.toLowerCase().trim();
    
    // Direct symbol match (e.g., "BTC", "BTCUSDT")
    let coin = marketData.find(c => 
        c.symbol.toLowerCase() === lowerQuery + 'usdt' || 
        c.symbol.toLowerCase().replace('usdt', '') === lowerQuery
    );
    if (coin) return coin;
    
    // Check aliases
    for (const [fullName, aliases] of Object.entries(coinAliases)) {
        if (aliases.some(alias => lowerQuery.includes(alias)) || lowerQuery.includes(fullName)) {
            // Find the corresponding coin
            const symbol = aliases[0].toUpperCase();
            coin = marketData.find(c => c.symbol.toLowerCase().startsWith(symbol.toLowerCase()));
            if (coin) return coin;
        }
    }
    
    // Partial match in symbol
    coin = marketData.find(c => 
        c.symbol.toLowerCase().includes(lowerQuery) || 
        lowerQuery.includes(c.symbol.toLowerCase().replace('usdt', ''))
    );
    
    return coin;
}

/**
 * Fallback response generator (used when backend is unavailable)
 * Provides smart responses using live market data
 */
function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting
    if (lowerMessage.match(/^(hi|hello|hey|مرحبا|السلام|أهلا)/)) {
        return `**مرحباً! أنا mAImona** 👋\n\nأنا مساعد تداول مدعوم بالذكاء الاصطناعي. يمكنني مساعدتك في:\n\n* **تحليل السوق** - معلومات حية عن العملات الرقمية\n* **أسعار العملات** - بيانات مباشرة من Binance\n* **الاتجاهات** - العملات الرائجة والأكثر تداولاً\n\nجرب أن تسألني: "ما سعر Bitcoin؟" أو "ما هي أكثر العملات تداولاً؟"`;
    }
    
    // Try to find a specific coin using smart search
    const foundCoin = findCoin(lowerMessage);
    if (foundCoin) {
        const changeDir = foundCoin.change24h >= 0 ? 'ارتفع' : 'انخفض';
        const changeSymbol = foundCoin.change24h >= 0 ? '+' : '';
        const emoji = foundCoin.change24h >= 0 ? '📈' : '📉';
        return `**${formatSymbol(foundCoin.symbol)}** ${emoji}\n\n* **السعر الحالي:** $${formatNumber(foundCoin.price)}\n* **التغير 24 ساعة:** ${changeSymbol}${foundCoin.change24h.toFixed(2)}% (${changeDir})\n* **حجم التداول:** $${formatVolume(foundCoin.volume24h)}\n\n${coinDescriptions[foundCoin.symbol] || 'هذه بيانات مباشرة من Binance.'}\n\n💡 تذكر: هذه معلومات فقط وليست نصيحة استثمارية.`;
    }
    
    // Price questions
    if (lowerMessage.match(/(سعر|price|كم|how much)/)) {
        const top3 = marketData.slice(0, 3);
        return `**أسعار أكثر العملات تداولاً الآن:** 💰\n\n* **${formatSymbol(top3[0].symbol)}:** $${formatNumber(top3[0].price)} (${top3[0].change24h >= 0 ? '+' : ''}${top3[0].change24h.toFixed(2)}%)\n* **${formatSymbol(top3[1].symbol)}:** $${formatNumber(top3[1].price)} (${top3[1].change24h >= 0 ? '+' : ''}${top3[1].change24h.toFixed(2)}%)\n* **${formatSymbol(top3[2].symbol)}:** $${formatNumber(top3[2].price)} (${top3[2].change24h >= 0 ? '+' : ''}${top3[2].change24h.toFixed(2)}%)\n\nاسألني عن أي عملة محددة للمزيد من التفاصيل!`;
    }
    
    // Top coins
    if (lowerMessage.match(/(top|أفضل|أكثر|الأعلى|highest|most)/)) {
        const top5 = marketData.slice(0, 5);
        let response = '**أكثر 5 عملات تداولاً حالياً:** 📈\n\n';
        top5.forEach((coin, i) => {
            const changeEmoji = coin.change24h >= 0 ? '🟢' : '🔴';
            response += `${i + 1}. **${formatSymbol(coin.symbol)}** ${changeEmoji}\n   السعر: $${formatNumber(coin.price)} | التغير: ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%\n\n`;
        });
        return response + 'البيانات محدثة مباشرة من Binance.';
    }
    
    // Market summary
    if (lowerMessage.match(/(market|سوق|overview|تحليل|analysis|summary|ملخص)/)) {
        const gainers = marketData.filter(c => c.change24h > 0).length;
        const losers = marketData.filter(c => c.change24h < 0).length;
        const topGainer = marketData.reduce((a, b) => a.change24h > b.change24h ? a : b);
        const topLoser = marketData.reduce((a, b) => a.change24h < b.change24h ? a : b);
        
        return `**ملخص السوق الحالي** 📊\n\n* **العملات في ارتفاع:** ${gainers} 🟢\n* **العملات في انخفاض:** ${losers} 🔴\n* **الأكثر ارتفاعاً:** ${formatSymbol(topGainer.symbol)} (+${topGainer.change24h.toFixed(2)}%)\n* **الأكثر انخفاضاً:** ${formatSymbol(topLoser.symbol)} (${topLoser.change24h.toFixed(2)}%)\n\nيمكنك استكشاف المزيد في الجدول أدناه.`;
    }
    
    // Trending/gainers/losers
    if (lowerMessage.match(/(trend|رائج|gainer|ارتفاع|loser|انخفاض|falling|rising)/)) {
        const sorted = [...marketData].sort((a, b) => b.change24h - a.change24h);
        const topGainers = sorted.slice(0, 3);
        const topLosers = sorted.slice(-3).reverse();
        
        let response = '**أكثر العملات ارتفاعاً اليوم:** 🚀\n\n';
        topGainers.forEach((coin, i) => {
            response += `${i + 1}. **${formatSymbol(coin.symbol)}** +${coin.change24h.toFixed(2)}% ($${formatNumber(coin.price)})\n`;
        });
        
        response += '\n**أكثر العملات انخفاضاً اليوم:** 📉\n\n';
        topLosers.forEach((coin, i) => {
            response += `${i + 1}. **${formatSymbol(coin.symbol)}** ${coin.change24h.toFixed(2)}% ($${formatNumber(coin.price)})\n`;
        });
        
        return response;
    }
    
    // Help/What can you do
    if (lowerMessage.match(/(help|مساعدة|what can|ماذا تستطيع|إيش بتقدر)/)) {
        return `**يمكنني مساعدتك في:** 🤖\n\n* **معلومات العملات** - اسأل عن أي عملة مثل "Bitcoin" أو "Ethereum"\n* **أسعار حية** - "ما سعر BTC؟" أو "كم سعر ETH؟"\n* **ملخص السوق** - "كيف حال السوق؟" أو "market overview"\n* **الترندات** - "أكثر العملات ارتفاعاً" أو "top gainers"\n* **مقارنات** - "قارن بين BTC و ETH"\n\n**جرب الآن!** اكتب سؤالك أدناه 👇`;
    }
    
    // Compare coins
    if (lowerMessage.match(/(compare|قارن|vs|versus|مقابل)/)) {
        const words = lowerMessage.split(/\s+/);
        const foundCoins = [];
        
        for (const word of words) {
            for (const coin of marketData.slice(0, 20)) {
                const symbol = coin.symbol.replace('USDT', '').toLowerCase();
                if (word.includes(symbol) && !foundCoins.find(c => c.symbol === coin.symbol)) {
                    foundCoins.push(coin);
                    if (foundCoins.length === 2) break;
                }
            }
            if (foundCoins.length === 2) break;
        }
        
        if (foundCoins.length === 2) {
            const [coin1, coin2] = foundCoins;
            return `**مقارنة:** ${formatSymbol(coin1.symbol)} vs ${formatSymbol(coin2.symbol)} ⚖️\n\n**${formatSymbol(coin1.symbol)}:**\n* السعر: $${formatNumber(coin1.price)}\n* التغير: ${coin1.change24h >= 0 ? '+' : ''}${coin1.change24h.toFixed(2)}%\n* الحجم: $${formatVolume(coin1.volume24h)}\n\n**${formatSymbol(coin2.symbol)}:**\n* السعر: $${formatNumber(coin2.price)}\n* التغير: ${coin2.change24h >= 0 ? '+' : ''}${coin2.change24h.toFixed(2)}%\n* الحجم: $${formatVolume(coin2.volume24h)}`;
        }
    }
    
    // If nothing matched, give a helpful response based on available data
    const randomCoin = marketData[Math.floor(Math.random() * Math.min(10, marketData.length))];
    
    // General questions handling
    if (lowerMessage.match(/(what|who|how|why|when|where|ما|من|كيف|لماذا|متى|أين|شو|ليش|وين)/)) {
        // Check if it's about crypto/finance
        if (lowerMessage.match(/(crypto|coin|token|blockchain|trading|invest|wallet|بلوكتشين|تداول|محفظة|استثمار)/)) {
            return `سؤال جيد! 🤔\n\nأنا متخصص في تحليل **بيانات السوق الحية** للعملات الرقمية. بإمكاني أن أخبرك عن:\n\n* الأسعار الحالية والتغيرات\n* أحجام التداول\n* الترندات والمقارنات\n\nلكن للأسئلة التعليمية المتعمقة، أنصحك بزيارة:\n* [CoinMarketCap Learn](https://coinmarketcap.com/learn/)\n* [Binance Academy](https://academy.binance.com/)\n\nأو اسألني عن عملة محددة! مثلاً: "ما سعر ${formatSymbol(randomCoin.symbol)}؟" 📊`;
        } else {
            // General non-crypto question
            return `أهلاً! 👋\n\nأنا **mAImona** - مساعد متخصص في **تحليل أسواق العملات الرقمية**.\n\nيمكنني مساعدتك في:\n✅ أسعار العملات الحية\n✅ تحليل السوق والترندات\n✅ مقارنة العملات\n✅ حجم التداول والتغيرات\n\nلكن للأسئلة العامة خارج العملات الرقمية، قد تحتاج لمساعد آخر مثل ChatGPT.\n\n💡 **جرب الآن:** اسألني "ما هي أكثر العملات ارتفاعاً؟"`;
        }
    }
    
    // Random helpful suggestion
    return `لم أفهم سؤالك تماماً، لكن يمكنني مساعدتك! 🤔\n\n**على سبيل المثال، حالياً:**\n* **${formatSymbol(randomCoin.symbol)}** يتداول عند $${formatNumber(randomCoin.price)}\n* التغير 24 ساعة: ${randomCoin.change24h >= 0 ? '+' : ''}${randomCoin.change24h.toFixed(2)}%\n\n**جرب أن تسأل:**\n* "ما سعر Bitcoin؟"\n* "أكثر العملات تداولاً"\n* "كيف حال السوق؟"\n* "قارن بين BTC و ETH"`;
}

function sendSuggestion(text) {
    chatInput.value = text;
    sendMessage();
    
    // Hide suggestion buttons after first use
    const suggestionsContainer = document.querySelector('.chat-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

/**
 * Convert Markdown formatting to HTML
 */
function markdownToHtml(text) {
    let html = text;
    
    // Headers: ## Header
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (but not in ** or __)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    
    // Code: `code`
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Unordered lists: * item or - item
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>\s*)+/g, '<ul>$&</ul>');
    
    // Line breaks: double newline = paragraph, single = <br>
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
    }
    
    return html;
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textP = document.createElement('p');
    
    // Convert Markdown to HTML for bot messages
    if (type === 'bot') {
        textP.innerHTML = markdownToHtml(text);
    } else {
        textP.textContent = text;
    }
    
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
    
    // Register Service Worker for better caching
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.log('⚠️ Service Worker registration failed:', error);
        }
    }
    
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
