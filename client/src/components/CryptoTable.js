import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, Avatar, TextField, Box, Chip, LinearProgress, Typography
} from '@mui/material';

const SOCKET_URL = 'http://localhost:5000';

const COLUMNS = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'price', label: 'Price (USD)', sortable: true },
  { id: 'market_cap', label: 'Market Cap', sortable: true },
  { id: 'percent_change_1h', label: '1h %', sortable: true },
  { id: 'percent_change_24h', label: '24h %', sortable: true },
  { id: 'percent_change_7d', label: '7d %', sortable: true },
];

function formatNumber(num, digits = 2) {
  if (!num && num !== 0) return '-';
  if (Math.abs(num) > 1e9)
    return (num / 1e9).toFixed(digits) + "B";
  if (Math.abs(num) > 1e6)
    return (num / 1e6).toFixed(digits) + "M";
  if (Math.abs(num) > 1e3)
    return (num / 1e3).toFixed(digits) + "K";
  return num.toLocaleString(undefined, { maximumFractionDigits: digits });
}

const CryptoTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [orderBy, setOrderBy] = useState('market_cap');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // Fetch initial data with search and sorting
  const fetchData = async (params = {}) => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/cryptos', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortDirection: order,
          search,
          ...params,
        },
      });
      setCryptoData(response.data.data);
      setTotal(response.data.total);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [orderBy, order, page, rowsPerPage, search]);

  // Real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('cryptoData', ({ data }) => {
      setCryptoData(data.slice(page * rowsPerPage, (page + 1) * rowsPerPage));
    });
    return () => socket.disconnect();
  }, [page, rowsPerPage]);

  // Handlers for table UI
  const handleRequestSort = (columnId) => {
    if (orderBy === columnId) setOrder(order === 'desc' ? 'asc' : 'desc');
    else setOrderBy(columnId);
  };

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Highlighted search text
  const highlight = (text, highlight) => {
    if (!highlight) return text;
    const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.substring(0, idx)}
        <span style={{ background: "#ffe066" }}>{text.substring(idx, idx + highlight.length)}</span>
        {text.substring(idx + highlight.length)}
      </>
    );
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Paper elevation={4} sx={{ p: 2, mb: 2, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Cryptocurrency Prices (Live)
        </Typography>
        <TextField
          label="Search by name or symbol"
          variant="outlined"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          fullWidth
          sx={{ mb: 2 }}
        />
        {isLoading ? <LinearProgress sx={{ my: 4 }} /> : null}
        <TableContainer sx={{ borderRadius: 3 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {COLUMNS.map(col => (
                  <TableCell
                    key={col.id}
                    sortDirection={orderBy === col.id ? order : false}
                    align={col.id === "name" ? "left" : "right"}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleRequestSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cryptoData.map((coin, idx) => (
                <TableRow key={coin.id}>
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={coin.image} alt={coin.symbol} sx={{ width: 28, height: 28, mr: 1 }} />
                      <Box>
                        <Typography component="span" fontWeight={600}>
                          {highlight(coin.name, search)}
                        </Typography>
                        <Chip size="small" label={coin.symbol} sx={{ ml: 1, fontWeight: 600 }} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">${formatNumber(coin.price, 8)}</TableCell>
                  <TableCell align="right">${formatNumber(coin.market_cap, 0)}</TableCell>
                  <TableCell align="right">
                    <span style={{ color: coin.percent_change_1h > 0 ? "#23c43a" : "#e23229" }}>
                      {coin.percent_change_1h?.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ color: coin.percent_change_24h > 0 ? "#23c43a" : "#e23229" }}>
                      {coin.percent_change_24h?.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ color: coin.percent_change_7d > 0 ? "#23c43a" : "#e23229" }}>
                      {coin.percent_change_7d?.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default CryptoTable;




















