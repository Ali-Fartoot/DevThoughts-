import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getToken } from './auth';

export default function CreateComment({ open, onClose, onCommentCreated, post_id }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleComment = async () => {
    if (!content.trim() || content.length > 280) return;
    
    setLoading(true);
    setError("");
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`http://localhost:8000/api/posts/${post_id}/comment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          content: {
            text: content,
            media: []
          },
          comments: [],
          likes: []
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setContent("");
        if (onCommentCreated) onCommentCreated(data);
        onClose();
        // Refresh the page to show the new comment
        window.location.reload();
      } else {
        throw new Error(data.detail || "Failed to create comment");
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      setError(err.message || "Failed to create comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError("");
  };

  const charCount = content.length;
  const isOverLimit = charCount > 280;
  const charLimitColor = isOverLimit ? "error.main" : "text.secondary";

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#000',
            color: '#fff',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            pb: 1,
            borderBottom: '1px solid #2f3336',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Create Comment
          </Typography>
          <IconButton 
            onClick={onClose} 
            aria-label="close"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="What are your thoughts?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  fontSize: '1.1rem',
                  pt: 1,
                  pb: 1,
                  color: 'white',
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
            
            {content && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ color: charLimitColor }}
                >
                  {charCount}/280
                </Typography>
              </Box>
            )}
          </Box>
          
          <Divider sx={{ borderColor: '#2f3336' }} />
          
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={handleComment}
                disabled={!content.trim() || isOverLimit || loading}
                sx={{ 
                  borderRadius: 99,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  bgcolor: '#1d9bf0',
                  '&:hover': {
                    bgcolor: '#1a8cd8',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(29, 155, 240, 0.5)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                {loading ? "Commenting..." : "Comment"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Comment created successfully!
        </Alert>
      </Snackbar>
    </>
  );
}