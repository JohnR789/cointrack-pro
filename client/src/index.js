require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security headers
app.use(helmet());
// CORS (allow your frontend's origin in production)
app.use(cors({ origin: "http://localhost:3000" }));

// Limit API abuse (10 requests/min/IP)
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 10 });
app.use('/api/', limiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// Cache to prevent over-requesting CoinMarketCap
let cachedData = null;
let lastFetchTime = null;

// Fetches, parses, and structures crypto data
const fetchCryptoData = async () => {
  try {
    console.log('Fetching data from CoinMarketCap...');
    const allData = [];
    const limit = 5000;
    let start = 1, moreData = true;

    while (moreData) {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        {
          headers: { 'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY },
          params: { start, limit, convert: 'USD' },
        }
      );
      const data = response.data.data;
      allData.push(...data);
      start += limit;
      if (data.length < limit) moreData = false;
    }

    // Shape for frontend use
    cachedData = allData.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      market_cap: coin.quote.USD.market_cap,
      percent_change_1h: coin.quote.USD.percent_change_1h,
      percent_change_24h: coin.quote.USD.percent_change_24h,
      percent_change_7d: coin.quote.USD.percent_change_7d,
      image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    }));
    lastFetchTime = Date.now();

    // Real-time update
    io.emit('cryptoData', { data: cachedData, lastUpdated: new Date(lastFetchTime).toISOString() });
    console.log(`Fetched ${allData.length} cryptocurrencies.`);
  } catch (error) {
    console.error('CoinMarketCap fetch error:', error.response?.data || error.message);
  }
};

// Poll every 10 min, plus on startup
setInterval(fetchCryptoData, 10 * 60 * 1000);
fetchCryptoData();

// Main API endpoint (supports sort, filter, paginate)
app.get('/api/cryptos', (req, res) => {
  if (!cachedData) return res.status(503).json({ error: 'Crypto data not yet available' });

  // Get params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const sortBy = req.query.sortBy || 'market_cap';
  const sortDirection = req.query.sortDirection || 'desc';
  const search = (req.query.search || '').toLowerCase();

  // Filter and sort
  let filtered = cachedData;
  if (search) {
    filtered = filtered.filter(
      coin => coin.name.toLowerCase().includes(search) || coin.symbol.toLowerCase().includes(search)
    );
  }

  const sorted = filtered.sort((a, b) => {
    if (sortDirection === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginated = sorted.slice(startIndex, startIndex + limit);

  res.json({
    total: filtered.length,
    data: paginated,
    lastUpdated: new Date(lastFetchTime).toISOString(),
  });
});

// WebSocket setup for real-time UI
io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  if (cachedData) {
    socket.emit('cryptoData', { data: cachedData, lastUpdated: new Date(lastFetchTime).toISOString() });
  }
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// Start server
server.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
