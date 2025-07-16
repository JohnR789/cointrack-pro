// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from "@mui/material";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Header = ({ darkMode, onToggleTheme }) => (
  <AppBar position="static" color="primary" elevation={2}>
    <Toolbar sx={{ justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <MonetizationOnIcon sx={{ fontSize: 36, mr: 1 }} />
        <Typography variant="h5" component="div" fontWeight={700}>
          CoinTrack Pro
        </Typography>
      </div>
      <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <IconButton color="inherit" onClick={onToggleTheme}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </Toolbar>
  </AppBar>
);

export default Header;

