import React, { useState, useEffect } from 'react'
import Signup from './Signup'
import Login from './Login'
import Home from './Home'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated as checkAuth } from './auth'

function App() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  // Check if user is already logged in on app load
  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  const handleSignup = () => {
    // Logic for signup
    console.log("Signup logic would go here")
  }

  const handleLogin = () => {
    // Logic for login
    console.log("Login logic would go here")
    setIsAuthenticated(true);
  }

  const handleLogout = () => {
    // Logic for logout
    console.log("Logout logic would go here")
    setIsAuthenticated(false);
  }

  // Watch for changes in authentication state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(checkAuth());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/home" element={isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate replace to="/signup" />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App