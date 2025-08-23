import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  Pagination,
  PaginationItem,
  IconButton,
  Fab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getToken, isAuthenticated } from './auth';
import Post from './Post';
import CreateComment from './CreateComment';

export default function Comments() {
  const [mainPost, setMainPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openCreateComment, setOpenCreateComment] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { post_id } = useParams();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    fetchPostAndComments(currentPage);
  }, [post_id, currentPage]);

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

  const fetchPostAndComments = async (page = 1) => {
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

      // Fetch the post or comment (this will be displayed as the main content)
      const postResponse = await fetch(`http://localhost:8000/api/posts/${post_id}/`, {
        method: 'GET',
        headers
      });

      if (!postResponse.ok) {
        throw new Error(`HTTP error! status: ${postResponse.status}`);
      }

      const postData = await postResponse.json();
      setMainPost(postData);

      // Fetch comments for this post/comment
      const commentsResponse = await fetch(`http://localhost:8000/api/posts/${post_id}/comments/?page=${page}`, {
        method: 'GET',
        headers
      });

      if (!commentsResponse.ok) {
        throw new Error(`HTTP error! status: ${commentsResponse.status}`);
      }

      const commentsData = await commentsResponse.json();
      setComments(commentsData.results || commentsData);
      
      if (commentsData.count) {
        // Calculate total pages based on count (5 items per page)
        setTotalPages(Math.ceil(commentsData.count / 5));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load post and comments. Please try again later. (Error: ${error.message})`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    // Go back to the previous page in history
    navigate(-1);
  };
  
  const handleHome = () => {
    // Navigate to home page
    navigate('/home');
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

  const handleCreateComment = () => {
    setOpenCreateComment(true);
  };

  const handleCloseCreateComment = () => {
    setOpenCreateComment(false);
  };

  const handleCommentCreated = (newComment) => {
    // Refresh comments after creating a new one
    fetchPostAndComments(currentPage);
  };

  const handleLike = (postId) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment._id === postId
          ? { ...comment, is_liked: true, like_count: comment.like_count + 1 }
          : comment
      )
    );
    
    // Also update the main post if it's the one being liked
    if (mainPost && mainPost._id === postId) {
      setMainPost(prevPost => ({
        ...prevPost,
        is_liked: true,
        like_count: prevPost.like_count + 1
      }));
    }
  };

  const handleUnlike = (postId) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment._id === postId
          ? { ...comment, is_liked: false, like_count: comment.like_count - 1 }
          : comment
      )
    );
    
    // Also update the main post if it's the one being unliked
    if (mainPost && mainPost._id === postId) {
      setMainPost(prevPost => ({
        ...prevPost,
        is_liked: false,
        like_count: prevPost.like_count - 1
      }));
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated()) {
    return null;
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
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                color: '#fff',
                mb: 2,
                justifyContent: 'flex-start',
                textTransform: 'none',
              }}
            >
              Back
            </Button>
            <Button
              startIcon={<HomeIcon />}
              onClick={handleHome}
              sx={{
                color: '#fff',
                mb: 2,
                justifyContent: 'flex-start',
                textTransform: 'none',
              }}
            >
              Home
            </Button>
            {isAuthenticated() && (
              <Button
                onClick={handleProfile}
                sx={{
                  color: '#fff',
                  mb: 2,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
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
            )}
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
          {/* Main post header */}
          <Paper square sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: '#000', borderBottom: '1px solid #2f3336' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Post
              </Typography>
            </Box>
          </Paper>

          {/* Main post or comment */}
          {mainPost && (
            <Post
              post={mainPost}
              onLike={handleLike}
              onUnlike={handleUnlike}
            />
          )}

          {/* Comments section */}
          <Paper square sx={{ bgcolor: '#000', borderBottom: '1px solid #2f3336' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Comments
              </Typography>
            </Box>
          </Paper>

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
                {comments.map((comment) => (
                  <Post
                    key={comment._id}
                    post={comment}
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
      </Box>

      <CreateComment 
        open={openCreateComment} 
        onClose={handleCloseCreateComment} 
        onCommentCreated={handleCommentCreated} 
        post_id={post_id}
      />
      
      <Fab 
        color="primary" 
        aria-label="add" 
        onClick={handleCreateComment}
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