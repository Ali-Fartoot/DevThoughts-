import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  ImageList,
  ImageListItem,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import CreateComment from './CreateComment';
import { getToken } from './auth';

export default function Post({ post, onLike, onUnlike, onComment, onShare }) {
  const navigate = useNavigate();
  const [openCreateComment, setOpenCreateComment] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = getToken();
        if (!token) return;
        
        const currentUsername = localStorage.getItem('username');
        let userId;
        
        // If it's the current user, use their ID directly
        if (post.username === currentUsername) {
          userId = null; // Will use default in backend
        } else {
          // For other users, get their ID first
          const userIdResponse = await fetch(`http://localhost:8000/api/accounts/user-id/?username=${post.username}`, {
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
    
    if (post.username) {
      fetchProfilePicture();
    }
    
    // Cleanup object URL when component unmounts
    return () => {
      if (profilePicture) {
        URL.revokeObjectURL(profilePicture);
      }
    };
  }, [post.username]); // Removed profilePicture from dependency array
  
  const handlePostClick = (e) => {
    // Prevent navigation if clicking on action buttons
    if (e.target.closest('button')) {
      return;
    }
    // Navigate to comments page
    navigate(`/comments/${post._id}`);
  };
  
  const handleLikeClick = async (e) => {
    e.stopPropagation(); // Prevent triggering the post click handler
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      if (post.is_liked) {
        // Unlike the post
        const response = await fetch(`http://localhost:8000/api/posts/${post._id}/unlike/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          if (onUnlike) onUnlike(post._id);
        } else {
          throw new Error("Failed to unlike post");
        }
      } else {
        // Like the post
        const response = await fetch(`http://localhost:8000/api/posts/${post._id}/like/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          if (onLike) onLike(post._id);
        } else {
          throw new Error("Failed to like post");
        }
      }
    } catch (err) {
      console.error("Error liking/unliking post:", err);
      alert(err.message || "Failed to like/unlike post. Please try again.");
    }
  };
  
  const handleCommentClick = (e) => {
    e.stopPropagation(); // Prevent triggering the post click handler
    // Open the create comment dialog
    setOpenCreateComment(true);
  };
  
  const handleCloseCreateComment = () => {
    setOpenCreateComment(false);
  };
  
  const handleCommentCreated = (newComment) => {
    // Optionally refresh the comments or update the UI
    if (onComment) onComment(post._id);
  };

  // Function to determine image layout based on number of images
  const getImageLayout = (imageCount) => {
    if (imageCount === 1) return { rows: 1, cols: 1 };
    if (imageCount === 2) return { rows: 1, cols: 2 };
    if (imageCount === 3) return { rows: 2, cols: 2 };
    if (imageCount >= 4) return { rows: 2, cols: 2 };
    return { rows: 1, cols: 1 };
  };

  // Function to get column span for images
  const getColSpan = (index, total) => {
    if (total === 3 && index === 0) return 2;
    return 1;
  };

  // Function to get row span for images
  const getRowSpan = (index, total) => {
    if (total === 3 && index === 0) return 2;
    return 1;
  };

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid #2f3336',
        '&:hover': {
          bgcolor: '#191919',
          cursor: 'pointer',
        },
        textAlign: 'left',
      }}
      onClick={handlePostClick}
    >
      <Box sx={{ display: 'flex' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'grey.800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            flexShrink: 0,
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
            <Typography fontWeight="bold">
              {post.username?.charAt(0)?.toUpperCase() || 'U'}
            </Typography>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography fontWeight="bold">
              {post.username || `User ${post.user_id}`}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mx: 1 }}>
              ·
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {new Date(post.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ py: 1 }}>
            <Typography>{post.content?.text || 'No content available'}</Typography>
            
            {/* Display images if they exist */}
            {post.content?.medias && post.content.medias.length > 0 && (
              <ImageList 
                variant="quilted" 
                cols={2}
                rows={2}
                gap={8}
                sx={{ mt: 2, maxHeight: 300 }}
              >
                {post.content.medias.slice(0, 4).map((media, index) => (
                  <ImageListItem 
                    key={index}
                    cols={getColSpan(index, post.content.medias.length)}
                    rows={getRowSpan(index, post.content.medias.length)}
                  >
                    <img
                      src={`http://localhost:8000${media}`}
                      alt={`Post media ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <IconButton 
              size="small" 
              sx={{ color: 'inherit' }}
              onClick={handleCommentClick}
            >
              <ChatIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {post.comments?.length || 0}
            </Typography>
            <IconButton 
              size="small" 
              sx={{ color: post.is_liked ? '#f91880' : 'inherit' }}
              onClick={handleLikeClick}
            >
              <FavoriteIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">
              {post.like_count || 0}
            </Typography>
            <IconButton 
              size="small" 
              sx={{ color: 'inherit', ml: 2 }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the post click handler
                if (onShare) onShare(post._id);
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      <CreateComment 
        open={openCreateComment} 
        onClose={handleCloseCreateComment} 
        onCommentCreated={handleCommentCreated} 
        post_id={post._id}
      />
    </Box>
  );
}