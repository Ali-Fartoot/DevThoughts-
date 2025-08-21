import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { login } from './auth';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make API call to login endpoint
      const response = await fetch('http://localhost:8000/api/accounts/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - store token and username, then redirect to user's page
        console.log("Logged in successfully:", data);
        login(data.token, data.username);
        if (onLogin) onLogin();
        navigate(`/user/${data.username}`);
      } else {
        // Handle API errors
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert("Login failed: " + (data.message || "Invalid credentials"));
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#000", color: "#fff" }}>
      {/* Left side - Branding */}
      <Box
        sx={{
          width: { xs: "0%", md: "50%" },
          bgcolor: "black",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography variant="h1" fontWeight="bold" sx={{ color: 'white', letterSpacing: '0.1em' }}>
            DevThoughts
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', mt: 2 }}>
            Share your thoughts on development.
          </Typography>
        </Box>
      </Box>
      
      {/* Right side - Login Form */}
      <Container
        maxWidth="sm"
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Box sx={{ mb: 6 }}>
            <Box
              component="svg"
              sx={{
                width: 40,
                height: 40,
                color: "white",
                mb: 3,
              }}
              viewBox="0 0 256 256"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M128 2l100 170L28 172z" fill="#41d1ff" stroke="#41d1ff" strokeWidth="40" strokeLinejoin="round"/>
              <path d="M128 2l-100 170L228 172z" fill="#fff" stroke="#fff" strokeWidth="40" strokeLinejoin="round"/>
            </Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Welcome back
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              id="username"
              label="Username"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#2f3336',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1d9bf0',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                },
              }}
              InputLabelProps={{
                style: { color: '#fff' },
              }}
              inputProps={{
                style: { color: '#fff' },
              }}
            />
            
            <FormControl fullWidth variant="outlined" error={!!errors.password} sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#2f3336',
                },
                '&:hover fieldset': {
                  borderColor: '#1d9bf0',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
              },
            }}>
              <InputLabel htmlFor="password" sx={{ color: '#fff' }}>Password</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                sx={{ color: '#fff' }}
              />
              {errors.password && (
                <FormHelperText>{errors.password}</FormHelperText>
              )}
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button sx={{ p: 0, minWidth: 0, color: '#1d9bf0' }}>
                Forgot password?
              </Button>
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ 
                py: 1.5, 
                mt: 2, 
                mb: 3,
                borderRadius: 99,
                bgcolor: '#1d9bf0',
                '&:hover': {
                  bgcolor: '#1a8cd8',
                }
              }}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </Box>
          
          <Box sx={{ mt: 6 }}>
            <Typography color="text.secondary">
              Don't have an account?{" "}
              <Box
                component="a"
                href="/signup"
                sx={{ color: "#1d9bf0", textDecoration: "none", fontWeight: "medium" }}
              >
                Sign up
              </Box>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}