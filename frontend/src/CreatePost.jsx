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
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function CreatePost({ open, onClose, onPost }) {
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handlePost = () => {
    if (content.trim()) {
      // In a real app, you would send this to your backend
      console.log("Posting:", content);
      if (onPost) onPost(content);
      setContent("");
      onClose();
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > 280;
  const charLimitColor = isOverLimit ? "error.main" : "text.secondary";

  return (
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
        </Box>
        
        <Divider sx={{ borderColor: '#2f3336' }} />
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handlePost}
              disabled={!content.trim() || isOverLimit}
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
              Post
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}