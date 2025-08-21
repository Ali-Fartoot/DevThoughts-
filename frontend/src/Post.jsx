import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { getToken } from './auth';

export default function Post({ post, onLike, onUnlike, onComment, onShare }) {
  const handleLikeClick = async (e) => {
    e.preventDefault();
    
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

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid #2f3336',
        '&:hover': {
          bgcolor: '#191919',
        },
        textAlign: 'left',
      }}
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
          }}
        >
          <Typography fontWeight="bold">
            {post.username?.charAt(0)?.toUpperCase() || 'U'}
          </Typography>
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
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <IconButton 
              size="small" 
              sx={{ color: 'inherit' }}
              onClick={() => onComment && onComment(post._id)}
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
              onClick={() => onShare && onShare(post._id)}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}