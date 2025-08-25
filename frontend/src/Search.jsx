import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { getToken } from './auth';
import Post from './Post';

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (page = 1) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`http://localhost:8000/api/search/?q=${encodeURIComponent(query)}&page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setTotalPages(Math.ceil(data.total / 10));
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      handleSearch(1);
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    handleSearch(page);
  };

  const handleLike = (postId) => {
    setResults(prevResults =>
      prevResults.map(post =>
        post.id === postId || post._id === postId
          ? { ...post, is_liked: true, like_count: (post.like_count || 0) + 1 }
          : post
      )
    );
  };

  const handleUnlike = (postId) => {
    setResults(prevResults =>
      prevResults.map(post =>
        post.id === postId || post._id === postId
          ? { ...post, is_liked: false, like_count: Math.max(0, (post.like_count || 1) - 1) }
          : post
      )
    );
  };

  return (
    <Box sx={{ bgcolor: '#000', color: '#fff', minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Search
      </Typography>
      <TextField
        fullWidth
        placeholder="Search for users, posts, or topics"
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
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
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : hasSearched ? (
        <Box sx={{ mt: 4 }}>
          {results.length > 0 ? (
            <>
              <Box>
                {results.map((post) => (
                  <Post
                    key={post.id || post._id}
                    post={{
                      ...post,
                      _id: post.id || post._id,
                      id: post.id || post._id
                    }}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                  />
                ))}
              </Box>
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
              No results found for "{query}"
            </Typography>
          )}
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>
          Enter a search query to find posts
        </Typography>
      )}
    </Box>
  );
}