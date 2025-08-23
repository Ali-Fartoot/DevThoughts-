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
  Snackbar,
  Alert,
  Pagination,
  PaginationItem,
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
import Post from './Post';

export default function UserPanel({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const { username } = useParams();

  const currentUser = localStorage.getItem('username') || null;
  
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = getToken();
        if (!token) return;
        
        const targetUsername = username || currentUser;
        const currentUsername = localStorage.getItem('username');
        let userId;
        
        // If it's the current user, use their ID directly
        if (targetUsername === currentUsername) {
          userId = null; // Will use default in backend
        } else {
          // For other users, get their ID first
          const userIdResponse = await fetch(`http://localhost:8000/api/accounts/user-id/?username=${targetUsername}`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
            },
          });
          
          if (!userIdResponse.ok) {
            console.log("Failed to get user ID");
            setProfilePicture(null);
            return;
          }
          
          const userIdData = await userIdResponse.json();
          userId = userIdData.user_id;
        }
        
        // Fetch the profile picture
        let url = 'http://localhost:8000/api/accounts/profile/';
        if (userId) {
          url += `?id=${userId}`;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          const imageUrl = URL.createObjectURL(await response.blob());
          setProfilePicture(imageUrl);
        } else if (response.status === 404) {
          // No profile picture found - this is normal, clear any existing picture
          setProfilePicture(null);
        }
      } catch (err) {
        console.log("Error fetching profile picture for user");
        setProfilePicture(null);
      }
    };
    
    if (isAuthenticated()) {
      fetchProfilePicture();
    }
    
    // Cleanup object URL when component unmounts
    return () => {
      if (profilePicture) {
        URL.revokeObjectURL(profilePicture);
      }
    };
  }, [username, currentUser]); // Removed profilePicture from dependency array

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchUserDataAndSettings = async () => {
      // Use username from params first, then fall back to currentUser from localStorage
      const targetUsername = username || currentUser;

      // Check if targetUsername is valid
      if (!targetUsername || targetUsername === 'default') {
        setError("Failed to identify user. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          throw new Error("User not authenticated");
        }

        const headers = {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch user data
        const userResponse = await fetch(`/api/user/${targetUsername}/`, { headers });
        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch settings data
        const settingsUrl = `/api/settings/${targetUsername}/`;
        const settingsResponse = await fetch(settingsUrl, { headers });
        if (!settingsResponse.ok) {
          throw new Error(`HTTP error! status: ${settingsResponse.status}`);
        }
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);

        // Fetch user's posts with pagination
        const postsResponse = await fetch(`/api/posts/user/?page=${currentPage}&page_size=7`, {
          method: 'GET',
          headers
        });

        if (!postsResponse.ok) {
          throw new Error(`HTTP error! status: ${postsResponse.status}`);
        }

        const postsData = await postsResponse.json();
        setUserPosts(postsData.results || postsData); // Handle both paginated and non-paginated responses
        
        if (postsData.count) {
          // Calculate total pages based on count (7 items per page)
          setTotalPages(Math.ceil(postsData.count / 7));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load user data. Please try again later. (Error: ${error.message})`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndSettings();
  }, [username, currentUser, navigate, currentPage]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

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

  const handlePostCreated = (newPost) => {
    // Add the new post to the top of the user's posts
    setUserPosts(prevPosts => [newPost, ...prevPosts]);
    // Refresh the page to ensure UI consistency
    window.location.reload();
  };

  const handleLike = (postId) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? { ...post, is_liked: true, like_count: post.like_count + 1 }
          : post
      )
    );
  };

  const handleUnlike = (postId) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? { ...post, is_liked: false, like_count: post.like_count - 1 }
          : post
      )
    );
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
                <ListItem button onClick={() => {
                  const targetUsername = username || currentUser;
                  if (targetUsername && targetUsername !== 'default') {
                    navigate(`/settings/${targetUsername}`);
                  } else {
                    // Redirect to login if username is not valid
                    navigate('/login');
                  }
                }} sx={{ borderRadius: 99 }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'grey.800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Typography variant="h4" fontWeight="bold">
                      {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {userData?.first_name && userData?.last_name
                      ? `${userData.first_name} ${userData.last_name}`
                      : userData?.username || 'User Profile'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{userData?.username || 'username'}
                  </Typography>
                </Box>
              </Box>

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

          {/* User posts section */}
          <Box>
            {userPosts.map((post) => (
              <Post
                key={post._id}
                post={post}
                onLike={handleLike}
                onUnlike={handleUnlike}
              />
            ))}
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  siblingCount={1}
                  boundaryCount={1}
                  renderItem={(item) => (
                    <PaginationItem
                      {...item}
                      sx={{
                        color: '#fff',
                        '&.Mui-selected': {
                          backgroundColor: '#1d9bf0',
                          color: '#fff',
                        },
                      }}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <CreatePost
        open={openCreatePost}
        onClose={handleCloseCreatePost}
        onPostCreated={handlePostCreated}
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

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
