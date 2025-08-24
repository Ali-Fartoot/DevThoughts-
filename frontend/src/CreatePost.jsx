import React, { useState, useRef } from "react";
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
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getToken } from './auth';

export default function CreatePost({ open, onClose, onPostCreated }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 4)); // Max 4 images
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handlePost = async () => {
    if ((!content.trim() || content.length > 280) && images.length === 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      
      // Add text content as a proper JSON object
      const contentObj = {
        text: content,
        medias: []
      };
      
      // Add content as a Blob to ensure proper JSON formatting
      formData.append('content', new Blob([JSON.stringify(contentObj)], {
        type: 'application/json'
      }));
      
      // Add arrays for comments and likes
      formData.append('comments', new Blob([JSON.stringify([])], {
        type: 'application/json'
      }));
      formData.append('likes', new Blob([JSON.stringify([])], {
        type: 'application/json'
      }));
      
      // Add image files if any
      if (images.length > 0) {
        images.forEach(image => {
          formData.append('attachments', image);
        });
      }

      const response = await fetch('http://localhost:8000/api/posts/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setContent("");
        setImages([]);
        if (onPostCreated) onPostCreated(data);
        onClose();
        // Refresh the page to show the new post
        window.location.reload();
      } else {
        throw new Error(data.detail || "Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post. Please try again.");
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
            Create Post
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
              placeholder="What's happening?"
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
            
            {/* Image preview chips */}
            {images.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {images.map((image, index) => (
                  <Chip
                    key={index}
                    label={image.name}
                    onDelete={() => removeImage(index)}
                    sx={{ bgcolor: '#1d9bf0', color: 'white' }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          <Divider sx={{ borderColor: '#2f3336' }} />
          
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <IconButton 
                onClick={triggerFileInput}
                sx={{ 
                  color: '#1d9bf0',
                  '&:hover': {
                    bgcolor: 'rgba(29, 155, 240, 0.1)',
                  }
                }}
              >
                <AddPhotoIcon />
              </IconButton>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              
              <Button 
                variant="contained" 
                onClick={handlePost}
                disabled={(!content.trim() && images.length === 0) || isOverLimit || loading}
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
                {loading ? "Posting..." : "Post"}
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
          Post created successfully!
        </Alert>
      </Snackbar>
    </>
  );
}