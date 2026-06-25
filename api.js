// api.js - CoinGecko API Integration

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Formats a number to USD currency format
function formatCurrency(value) {
    if (!value) return '$0.00';
    if (value < 0.01) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 4 }).format(value);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// Formats a percentage
function formatPercentage(value) {
    if (value === undefined || value === null) return '0.0%';
    const formatted = Math.abs(value).toFixed(2) + '%';
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export async function initMarketData() {
    try {
        await Promise.all([
            fetchTickerData(),
            fetchMarketOverview()
        ]);
    } catch (error) {
        console.error("Error initializing market data:", error);
    }
}

async function fetchTickerData() {
    const tickerContainer = document.getElementById('ticker-content');
    if (!tickerContainer) return;

    try {
        const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const coins = [
            { id: 'bitcoin', symbol: 'BTC' },
            { id: 'ethereum', symbol: 'ETH' },
            { id: 'solana', symbol: 'SOL' },
            { id: 'binancecoin', symbol: 'BNB' },
            { id: 'ripple', symbol: 'XRP' }
        ];

        let html = '';
        coins.forEach(coin => {
            const coinData = data[coin.id];
            if (coinData) {
                const price = formatCurrency(coinData.usd);
                const change = coinData.usd_24h_change;
                const changeClass = change >= 0 ? 'ticker-up' : 'ticker-down';
                const arrow = change >= 0 ? '▲' : '▼';
                
                html += `<span class="ticker-item">${coin.symbol} <span class="${changeClass}">${arrow} ${price} (${formatPercentage(change)})</span></span>`;
            }
        });
        
        tickerContainer.innerHTML = html;
        
    } catch (error) {
        console.error("Failed to fetch ticker data:", error);
        tickerContainer.innerHTML = `<span class="ticker-item">Unable to load live market data. Please try again later.</span>`;
    }
}

async function fetchMarketOverview() {
    const gainersContainer = document.getElementById('top-gainers-list');
    const losersContainer = document.getElementById('top-losers-list');
    const trendingContainer = document.getElementById('trending-list');

    if (!gainersContainer && !losersContainer && !trendingContainer) return;

    try {
        // Fetch Trending
        if (trendingContainer) {
            fetchTrending(trendingContainer);
        }

        // Fetch Top 100 for Gainers/Losers
        if (gainersContainer || losersContainer) {
            const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // Filter out stablecoins ideally, but for now just sort by 24h change
            const validData = data.filter(coin => coin.price_change_percentage_24h !== null);
            
            // Top Gainers
            if (gainersContainer) {
                const gainers = [...validData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
                gainersContainer.innerHTML = renderTrackingList(gainers);
            }

            // Top Losers
            if (losersContainer) {
                const losers = [...validData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);
                losersContainer.innerHTML = renderTrackingList(losers);
            }
        }
    } catch (error) {
        console.error("Failed to fetch market overview data:", error);
        const errorHtml = `<div style="padding: 10px; color: var(--danger-color); text-align: center;">Failed to load data</div>`;
        if (gainersContainer) gainersContainer.innerHTML = errorHtml;
        if (losersContainer) losersContainer.innerHTML = errorHtml;
    }
}

async function fetchTrending(container) {
    try {
        const response = await fetch(`${COINGECKO_BASE_URL}/search/trending`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const topTrending = data.coins.slice(0, 5).map(item => ({
            id: item.item.id,
            symbol: item.item.symbol,
            name: item.item.name,
            image: item.item.thumb,
            // Coingecko trending API doesn't always provide reliable usd price/change in the basic endpoint, 
            // but we can parse data.price if available, or just show the rank.
            // Recently it provides data.price and data.price_change_percentage_24h.usd
            current_price: item.item.data?.price || 0,
            price_change_percentage_24h: item.item.data?.price_change_percentage_24h?.usd || 0,
            isTrendingRaw: true
        }));

        container.innerHTML = renderTrackingList(topTrending);
    } catch (error) {
        console.error("Failed to fetch trending data:", error);
        container.innerHTML = `<div style="padding: 10px; color: var(--danger-color); text-align: center;">Failed to load data</div>`;
    }
}

function renderTrackingList(coins) {
    let html = '';
    coins.forEach(coin => {
        const symbol = coin.symbol.toUpperCase();
        const change = coin.price_change_percentage_24h;
        const changeClass = change >= 0 ? 'ticker-up' : 'ticker-down';
        const changeStr = formatPercentage(change);
        
        let priceStr = '';
        if (coin.isTrendingRaw && typeof coin.current_price === 'string') {
            // Trending API might return price as a formatted string like "$1.23"
            priceStr = coin.current_price.startsWith('$') ? coin.current_price : `$${coin.current_price}`;
            // Remove huge decimals if it's very small and formatted badly
            if(priceStr.length > 10 && priceStr.includes('.')) priceStr = priceStr.substring(0, 10);
        } else {
            priceStr = formatCurrency(coin.current_price);
        }

        html += `
            <div class="tracking-row">
                <span class="coin-info">
                    <img src="${coin.image}" alt="${symbol}" class="coin-logo" onerror="this.src='https://assets.coingecko.com/coins/images/1/standard/bitcoin.png'"> 
                    <span class="coin-symbol">${symbol}</span> 
                    <span class="coin-name">${coin.name}</span>
                </span>
                <div class="price-info">
                    <span class="coin-price">${priceStr}</span>
                    <span class="coin-change ${changeClass}">${changeStr}</span>
                </div>
            </div>
        `;
    });
    return html;
}
