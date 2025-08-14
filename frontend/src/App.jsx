import React, { useState, useEffect } from 'react'
import Signup from './Signup'
import Login from './Login'
import Home from './Home'
import UserPanel from './UserPanel'
import Settings from './Settings'
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
    // After signup, redirect to login page
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
        <Route path="/home" element={<Home />} />
        <Route path="/user/:username" element={isAuthenticated ? <UserPanel onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate replace to="/home" />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App