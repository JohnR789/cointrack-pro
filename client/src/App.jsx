// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";
import Header from "./components/Header";
import CryptoTable from "./components/CryptoTable";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./theme";

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Use system preference or previous choice
    const stored = localStorage.getItem("themeMode");
    return stored ? stored === "dark" : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem("themeMode", darkMode ? "dark" : "light");
  }, [darkMode]);

  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((v) => !v)} />
      <CryptoTable />
    </ThemeProvider>
  );
};

export default App;

