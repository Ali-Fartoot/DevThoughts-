import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { logout, isAuthenticated, getToken } from './auth';

export default function UserPanel({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { username } = useParams();

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user data from backend
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${username}/`, {
          headers: {
            'Authorization': `Token ${getToken()}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [username, navigate]);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/home');
  };

  // Don't render if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', justifyContent: 'center', alignItems: 'center' }}>
      <Box
        sx={{
          width: { xs: '100%', md: 600 },
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Profile
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Username:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {userData?.username || 'N/A'}
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            First Name:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {userData?.first_name || 'N/A'}
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Last Name:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {userData?.last_name || 'N/A'}
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Email:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {userData?.email || 'N/A'}
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Sex:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {userData?.sex || 'N/A'}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate(`/settings/${username}`)}
        >
          Settings
        </Button>
      </Box>
    </Box>
  );
}