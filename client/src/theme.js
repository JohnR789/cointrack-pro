// src/theme.js
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#15192c' },
            secondary: { main: '#fbc02d' },
            background: { default: '#f4f7fa' },
          }
        : {
            primary: { main: '#fbc02d' },
            secondary: { main: '#15192c' },
            background: { default: '#10151c' },
            text: { primary: '#fff', secondary: '#b3b3b3' },
          }),
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: mode === 'dark' ? '#18202b' : '#fff',
          },
        },
      },
    },
  });
