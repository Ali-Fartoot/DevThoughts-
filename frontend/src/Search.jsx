import React from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

export default function Search() {
  return (
    <Box sx={{ bgcolor: '#000', color: '#fff', minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Search
      </Typography>
      <TextField
        fullWidth
        placeholder="Search for users, posts, or topics"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }}/>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 99,
            bgcolor: '#202327',
            color: '#fff',
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }
        }}
        sx={{ mt: 2 }}
      />
      {/* Add search results here */}
    </Box>
  );
}