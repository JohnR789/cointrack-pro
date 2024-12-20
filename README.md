# CoinTrack Pro

CoinTrack Pro is a modern cryptocurrency tracker application that provides real-time updates, live pricing, and detailed market statistics for over 10,000 cryptocurrencies. Powered by CoinMarketCap's API and enhanced with WebSocket technology, CoinTrack Pro ensures seamless and dynamic updates to keep you informed about the latest in the crypto world.

## Features

- **Live Cryptocurrency Prices**: Get up-to-date pricing for thousands of cryptocurrencies.
- **Real-Time Updates**: WebSocket integration enables live updates without refreshing the page.
- **Detailed Market Data**:
  - Market Cap
  - Price (USD)
  - 1-hour, 24-hour, and 7-day percentage changes
- **Search and Filter**: Quickly find any cryptocurrency by name or symbol.
- **Pagination**: Browse through data with a responsive and user-friendly pagination system.
- **Sorting**: Sort data by various metrics, such as market cap or price.

## Technologies Used

### Frontend
- **React.js**: For building a dynamic user interface.
- **Socket.IO**: For live updates using WebSocket.
- **Axios**: For fetching initial cryptocurrency data from the backend.
- **CSS**: Modern styles with responsive design.

### Backend
- **Node.js**: Server-side runtime environment.
- **Express.js**: Lightweight and flexible web application framework.
- **Socket.IO**: Handles WebSocket communication for real-time updates.
- **CoinMarketCap API**: Fetches cryptocurrency data.

## Installation

### Prerequisites
Ensure you have the following installed:
- Node.js (v16 or later)
- npm (Node Package Manager)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cointrack-pro.git
   ```

2. Navigate to the project directory:
   ```bash
   cd cointrack-pro
   ```

3. Install dependencies for both frontend and backend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory:
     ```
     COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
     ```

5. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

6. Start the frontend:
   ```bash
   cd ../frontend
   npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`.

## Project Structure
```
cointrack-pro/
├── backend/
│   ├── server.js         # Express server with WebSocket integration
│   ├── package.json      # Backend dependencies
│   └── .env              # Environment variables for API keys
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CryptoTable.js # Main component for cryptocurrency data
│   │   ├── App.js        # Main React app
│   │   └── index.js      # React entry point
│   ├── public/           # Static files
│   ├── package.json      # Frontend dependencies
│   └── README.md         # Frontend-specific README
├── README.md             # Project README
└── .gitignore
```

## Future Enhancements
- **Advanced Filtering**: Filter by more metrics, such as trading volume or circulating supply.
- **Historical Data Visualization**: Add graphs and charts for price trends.
- **User Accounts**: Allow users to save and monitor their favorite cryptocurrencies.
- **Mobile App**: Build a React Native app for tracking cryptocurrencies on the go.

## License
This project is licensed under the [MIT License](LICENSE).

## Contributing
We welcome contributions! Please fork the repository and create a pull request for any features, bug fixes, or documentation updates.

## Acknowledgments
- [CoinMarketCap API](https://coinmarketcap.com/api/)
- [React.js Documentation](https://reactjs.org/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)

---
**Developed by John Rollins