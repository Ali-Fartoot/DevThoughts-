import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Post</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handlePost}
          disabled={!content.trim()}
        >
          Post
        </Button>
      </DialogActions>
    </Dialog>
  );
}