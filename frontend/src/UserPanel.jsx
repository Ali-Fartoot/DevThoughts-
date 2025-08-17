import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Fab,
} from "@mui/material";
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { logout, isAuthenticated, getToken } from './auth';
import CreatePost from './CreatePost';

// Mock data for user posts
const mockUserPosts = [
  {
    id: 1,
    content: "Just finished working on my new project! Feeling accomplished. #coding #development",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    content: "Beautiful day for a walk in the park. Nature always helps clear my mind. 🌳",
    timestamp: "1 day ago",
    likes: 42,
    comments: 3
  },
  {
    id: 3,
    content: "Learning something new every day keeps the mind sharp. What are you working on today?",
    timestamp: "3 days ago",
    likes: 18,
    comments: 7
  }
];

export default function UserPanel({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [userPosts] = useState(mockUserPosts);
  const navigate = useNavigate();
  const { username } = useParams();

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user data and settings from backend
    const fetchUserDataAndSettings = async () => {
      try {
        const token = getToken();
        const headers = {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        };

        const [userResponse, settingsResponse] = await Promise.all([
          fetch(`/api/user/${username}/`, { headers }),
          fetch(`/api/settings/${username}/`, { headers })
        ]);
        
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
          navigate('/home');
        }

        if (settingsResponse.ok) {
          const data = await settingsResponse.json();
          setSettings(data);
        } else {
          console.error('Failed to fetch settings data');
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDataAndSettings();
  }, [username, navigate]);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/home');
  };

  const handleCreatePost = () => {
    setOpenCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setOpenCreatePost(false);
  };

  const handlePost = (content) => {
    // Handle the post submission
    console.log("Posted content:", content);
    // In a real app, you would send this to your backend
  };

  // Don't render if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#000' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#000', color: '#fff', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', width: '100%', maxWidth: 950, marginRight: '100px' }}>
        {/* Left sidebar */}
        <Box
          component="nav"
          sx={{
            width: { lg: 250 },
            flexShrink: { lg: 0 },
            p: 2,
          }}
        >
          <Box sx={{ position: 'sticky', top: 16 }}>
            <Box sx={{ mb: 3 }}>
              <List component="nav">
                <ListItem button onClick={() => navigate('/home')} sx={{ borderRadius: 99 }}>
                  <HomeIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Home" />
                </ListItem>
                <ListItem button onClick={() => navigate('/search')} sx={{ borderRadius: 99 }}>
                  <SearchIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Search" />
                </ListItem>
                <ListItem button onClick={() => navigate(`/settings/${username}`)} sx={{ borderRadius: 99 }}>
                  <SettingsIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Settings" />
                </ListItem>
                <Divider sx={{ my: 1, borderColor: '#2f3336' }} />
                <ListItem button onClick={handleLogout} sx={{ borderRadius: 99 }}>
                  <LogoutIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            borderRight: 1,
            borderColor: 'divider',
            maxWidth: { md: 600 },
            borderLeft: '1px solid #2f3336',
            borderRight: '1px solid #2f3336',
          }}
        >
          {/* Profile header */}
          <Paper square sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: '#000', borderBottom: '1px solid #2f3336' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {userData?.first_name && userData?.last_name 
                  ? `${userData.first_name} ${userData.last_name}` 
                  : userData?.username || 'User Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                @{userData?.username || 'username'}
              </Typography>
              
              {/* Profile information in header */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">
                    {userData?.username || 'N/A'}
                  </Typography>
                </Box>
                
                {settings?.show_email && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {userData?.email || 'N/A'}
                    </Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {userData?.first_name && userData?.last_name 
                      ? `${userData.first_name} ${userData.last_name}` 
                      : 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sex
                  </Typography>
                  <Typography variant="body1">
                    {userData?.sex || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
          
          <Box>
            {/* User posts section */}
            {userPosts.map((post) => (
              <Box 
                key={post.id} 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #2f3336',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#191919',
                  },
                }}
              >
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <Typography variant="caption">
                    {post.timestamp}
                  </Typography>
                  <Typography variant="caption" sx={{ mx: 1 }}>
                    ·
                  </Typography>
                  <Typography variant="caption">
                    {post.likes} likes
                  </Typography>
                  <Typography variant="caption" sx={{ mx: 1 }}>
                    ·
                  </Typography>
                  <Typography variant="caption">
                    {post.comments} comments
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      
      <CreatePost 
        open={openCreatePost} 
        onClose={handleCloseCreatePost} 
        onPost={handlePost} 
      />

      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={handleCreatePost}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: '#1d9bf0',
          '&:hover': {
            bgcolor: '#1a8cd8',
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}