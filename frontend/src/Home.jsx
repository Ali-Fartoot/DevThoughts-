import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Pagination,
  PaginationItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  Loop as LoopIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getToken, isAuthenticated } from './auth';
import CreatePost from './CreatePost';
import Post from './Post';

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

  // Mock data for suggested follows
  // const mockSuggestedFollows = [
  //   { id: 1, name: "React", username: "reactjs", avatar: "R" },
  //   { id: 2, name: "Vercel", username: "vercel", avatar: "V" },
  //   { id: 3, name: "Material UI", username: "mui", avatar: "M" }
  // ];

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = getToken();
        if (!token) return;
        
        // For current user, don't pass ID parameter - backend will use request.user.id
        const response = await fetch('http://localhost:8000/api/accounts/profile/', {
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
  }, []); // Removed profilePicture from dependency array
  
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const token = getToken();
      
      // For now, we'll use mock data if user is not authenticated
      if (!token) {
        // Mock data for tweets
        const mockTweets = [
          {
            _id: 1,
            name: "John Doe",
            username: "johndoe",
            content: { text: "Just shipped a new feature! The feeling of accomplishment is unmatched. #coding #developer" },
            created_at: new Date().toISOString(),
            like_count: 24,
            comments: []
          },
          {
            _id: 2,
            name: "Jane Smith",
            username: "janesmith",
            content: { text: "Beautiful sunset today. Sometimes we need to pause and appreciate the simple things in life. 🌅" },
            created_at: new Date().toISOString(),
            like_count: 142,
            comments: []
          },
          {
            _id: 3,
            name: "Tech News",
            username: "technews",
            content: { text: "Breaking: New framework released that promises to revolutionize web development. What are your thoughts?" },
            created_at: new Date().toISOString(),
            like_count: 842,
            comments: []
          }
        ];
        setTweets(mockTweets);
        setLoading(false);
        return;
      }

      // Fetch real posts from backend with pagination
      const response = await fetch(`http://localhost:8000/api/posts/?page=${page}&page_size=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTweets(data.results || data); // Handle both paginated and non-paginated responses
        if (data.count) {
          // Calculate total pages based on count (10 items per page)
          setTotalPages(Math.ceil(data.count / 10));
        }
      } else {
        throw new Error("Failed to fetch posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleProfile = () => {
    // Get the username from localStorage
    const username = localStorage.getItem('username');
    if (username) {
      navigate(`/user/${username}`);
    } else {
      // Redirect to login if username is not found
      navigate('/login');
    }
  };

  const handleCreatePost = () => {
    setOpenCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setOpenCreatePost(false);
  };

  const handlePostCreated = (newPost) => {
    // Add the new post to the top of the list
    setTweets(prevTweets => [newPost, ...prevTweets]);
    // Refresh current page to show the new one
    fetchPosts(currentPage);
    // Refresh the page to ensure UI consistency
    window.location.reload();
  };

  const handleLike = (postId) => {
    setTweets(prevTweets => 
      prevTweets.map(tweet => 
        tweet._id === postId 
          ? { ...tweet, is_liked: true, like_count: tweet.like_count + 1 } 
          : tweet
      )
    );
  };

  const handleUnlike = (postId) => {
    setTweets(prevTweets => 
      prevTweets.map(tweet => 
        tweet._id === postId 
          ? { ...tweet, is_liked: false, like_count: tweet.like_count - 1 } 
          : tweet
      )
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#000', color: '#fff', justifyContent: 'center' }}>
      {/* Left sidebar */}
      <Box
        component="nav"
        sx={{
          width: { xs: '100%', md: 250 },
          flexShrink: { md: 0 },
          bgcolor: '#000',
          borderRight: '1px solid #2f3336',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            DevThoughts
          </Typography>
          
          <MenuList>
            <MenuItem onClick={() => navigate('/search')} sx={{ borderRadius: 99 }}>
              <SearchIcon sx={{ mr: 2 }} />
              <ListItemText primary="Search" />
            </MenuItem>
          </MenuList>
        </Box>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          borderRight: '1px solid #2f3336',
          maxWidth: { md: 600 },
        }}
      >
        <Paper square sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: '#000', borderBottom: '1px solid #2f3336' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Home</Typography>
          </Box>
        </Paper>
        
        {/* Action buttons moved to main content area */}
        <Box sx={{ p: 2, borderBottom: '1px solid #2f3336', display: 'flex', gap: 2 }}>
          {isAuthenticated() ? (
            <>
              <Button
                variant="contained"
                sx={{ 
                  borderRadius: 99,
                  bgcolor: '#1d9bf0',
                  '&:hover': {
                    bgcolor: '#1a8cd8',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  pl: 1.5,
                  pr: 2,
                }}
                onClick={handleProfile}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
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
                    <Typography variant="caption" fontWeight="bold">
                      {localStorage.getItem('username')?.charAt(0)?.toUpperCase() || 'U'}
                    </Typography>
                  )}
                </Box>
                Profile
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  borderRadius: 99,
                  bgcolor: '#1d9bf0',
                  '&:hover': {
                    bgcolor: '#1a8cd8',
                  }
                }}
                onClick={handleCreatePost}
              >
                Create Post
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                sx={{ 
                  borderRadius: 99,
                  bgcolor: '#1d9bf0',
                  '&:hover': {
                    bgcolor: '#1a8cd8',
                  }
                }}
                onClick={handleLogin}
              >
                Log in
              </Button>
              <Button
                variant="outlined"
                onClick={handleSignup}
                sx={{
                  borderRadius: 99,
                  borderColor: '#1d9bf0',
                  color: '#1d9bf0',
                  '&:hover': {
                    borderColor: '#1a8cd8',
                    color: '#1a8cd8',
                  }
                }}
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <Box>
              {tweets.map((tweet) => (
                <Post
                  key={tweet._id}
                  post={tweet}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
            </Box>
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
          </>
        )}
      </Box>
      
      {/* Right sidebar */}
      <Box
        sx={{
          width: { lg: 350 },
          flexShrink: { lg: 0 },
          display: { xs: 'none', lg: 'block' },
          p: 2,
        }}
      >
        <Box sx={{ position: 'sticky', top: 0 }}>
        </Box>
      </Box>
      
      <CreatePost 
        open={openCreatePost} 
        onClose={handleCloseCreatePost} 
        onPostCreated={handlePostCreated} 
      />
      
      {isAuthenticated() && (
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
      )}
    </Box>
  );
}