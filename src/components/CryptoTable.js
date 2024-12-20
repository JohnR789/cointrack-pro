import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './CryptoTable.css';

const connectSocket = () => {
    const socket = io('http://localhost:5000'); // Replace with your backend's URL
    return socket;
};

const CryptoTable = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(30);
    const [sortBy, setSortBy] = useState('market_cap');
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:5000/api/cryptos', {
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                        sortBy,
                        sortDirection,
                    },
                });
                setCryptoData(response.data.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setIsLoading(false);
            }
        };

        fetchInitialData();

        // WebSocket connection with auto-reconnection
        let socket = connectSocket();

        const setupSocket = () => {
            socket.on('connect', () => {
                console.log('WebSocket connected');
            });

            socket.on('cryptoData', (data) => {
                console.log('Received real-time update:', data);
                setCryptoData(data.data);
            });

            socket.on('disconnect', () => {
                console.log('WebSocket disconnected, attempting to reconnect...');
                setTimeout(() => {
                    socket = connectSocket();
                    setupSocket();
                }, 5000); // Reconnect after 5 seconds
            });
        };

        setupSocket();

        return () => {
            socket.disconnect(); // Cleanup on unmount
        };
    }, [currentPage, itemsPerPage, sortBy, sortDirection]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
        } else {
            setSortBy(field);
            setSortDirection('desc');
        }
    };

    const filteredData = cryptoData.filter(
        (coin) =>
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container">
            <h1 className="title">CoinTrack Pro</h1>
            <input
                type="text"
                placeholder="Search cryptocurrency"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th onClick={() => handleSort('name')}>Name</th>
                                <th onClick={() => handleSort('price')}>Price (USD)</th>
                                <th onClick={() => handleSort('market_cap')}>Market Cap</th>
                                <th onClick={() => handleSort('percent_change_1h')}>1h %</th>
                                <th onClick={() => handleSort('percent_change_24h')}>24h %</th>
                                <th onClick={() => handleSort('percent_change_7d')}>7d %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((coin, index) => (
                                <tr key={coin.id}>
                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td>
                                        <img
                                            src={coin.image}
                                            alt={coin.name}
                                            className="coin-image"
                                        />
                                        {coin.name}
                                    </td>
                                    <td>${coin.price.toFixed(8)}</td>
                                    <td>${coin.market_cap.toLocaleString()}</td>
                                    <td
                                        className={
                                            coin.percent_change_1h > 0 ? 'positive' : 'negative'
                                        }
                                    >
                                        {coin.percent_change_1h?.toFixed(2)}%
                                    </td>
                                    <td
                                        className={
                                            coin.percent_change_24h > 0 ? 'positive' : 'negative'
                                        }
                                    >
                                        {coin.percent_change_24h?.toFixed(2)}%
                                    </td>
                                    <td
                                        className={
                                            coin.percent_change_7d > 0 ? 'positive' : 'negative'
                                        }
                                    >
                                        {coin.percent_change_7d?.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {Array.from({ length: 10 }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={currentPage === 10}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CryptoTable;



















