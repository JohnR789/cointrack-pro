require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5000;

// Create an HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend's URL
        methods: ["GET", "POST"],
    },
});

app.use(cors());

let cachedData = null; // Cached API response
let lastFetchTime = null; // Timestamp of the last fetch

const fetchCryptoData = async () => {
    try {
        console.log('Fetching data from CoinMarketCap...');
        const allData = [];
        const limit = 5000; // Maximum number of items per request
        let start = 1;
        let moreData = true;

        while (moreData) {
            const response = await axios.get(
                'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
                {
                    headers: {
                        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
                    },
                    params: {
                        start,
                        limit,
                        convert: 'USD',
                    },
                }
            );

            const data = response.data.data;
            allData.push(...data);
            start += limit;

            // Break if no more data to fetch
            if (data.length < limit) {
                moreData = false;
            }
        }

        cachedData = allData.map((coin) => ({
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

        console.log(`Fetched ${allData.length} cryptocurrencies.`);

        // Emit the updated data to all connected clients
        io.emit('cryptoData', { data: cachedData, lastUpdated: new Date(lastFetchTime).toISOString() });
    } catch (error) {
        console.error('Error fetching data from CoinMarketCap:', error.response?.data || error.message);
    }
};

// Fetch data every 10 minutes
setInterval(fetchCryptoData, 10 * 60 * 1000);
fetchCryptoData();

app.get('/api/cryptos', (req, res) => {
    if (!cachedData) {
        return res.status(500).json({ error: 'Data not available yet, please try again later.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const sortBy = req.query.sortBy || 'market_cap';
    const sortDirection = req.query.sortDirection || 'desc';

    // Sort the cached data
    const sortedData = [...cachedData].sort((a, b) => {
        if (sortDirection === 'asc') {
            return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
            return a[sortBy] < b[sortBy] ? 1 : -1;
        }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = sortedData.slice(startIndex, endIndex);

    res.json({
        total: cachedData.length,
        data: paginatedData,
        lastUpdated: new Date(lastFetchTime).toISOString(),
    });
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    // Send the initial data when a client connects
    if (cachedData) {
        socket.emit('cryptoData', { data: cachedData, lastUpdated: new Date(lastFetchTime).toISOString() });
    }

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));













