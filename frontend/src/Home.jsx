import React, { useState } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  Loop as LoopIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Share as ShareIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { logout } from './auth';

// Mock data for tweets
const mockTweets = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    content: "Just shipped a new feature! The feeling of accomplishment is unmatched. #coding #developer",
    timestamp: "2h ago",
    likes: 24,
    retweets: 5,
    comments: 3
  },
  {
    id: 2,
    name: "Jane Smith",
    username: "janesmith",
    content: "Beautiful sunset today. Sometimes we need to pause and appreciate the simple things in life. 🌅",
    timestamp: "4h ago",
    likes: 142,
    retweets: 27,
    comments: 8
  },
  {
    id: 3,
    name: "Tech News",
    username: "technews",
    content: "Breaking: New framework released that promises to revolutionize web development. What are your thoughts?",
    timestamp: "6h ago",
    likes: 842,
    retweets: 327,
    comments: 142
  }
];

// Mock data for trends
const mockTrends = [
  { id: 1, category: "Technology", title: "React 19", tweets: "50.4K" },
  { id: 2, category: "Sports", title: "World Cup", tweets: "125K" },
  { id: 3, category: "Entertainment", title: "New Movie Release", tweets: "24.5K" },
  { id: 4, category: "Politics", title: "Elections", tweets: "87.2K" }
];

// Mock data for suggested follows
const mockSuggestedFollows = [
  { id: 1, name: "React", username: "reactjs", avatar: "R" },
  { id: 2, name: "Vercel", username: "vercel", avatar: "V" },
  { id: 3, name: "Material UI", username: "mui", avatar: "M" }
];

export default function Home({ onLogout }) {
  const [tweets] = useState(mockTweets);
  const [trends] = useState(mockTrends);
  const [suggestedFollows] = useState(mockSuggestedFollows);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left sidebar */}
      <Box
        component="nav"
        sx={{
          width: { xs: '100%', md: 250 },
          flexShrink: { md: 0 },
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            My App
          </Typography>
          
          <MenuList>
            {["Home", "Explore", "Notifications", "Messages", "Bookmarks", "Lists", "Profile"].map((item) => (
              <MenuItem key={item}>
                <ListItemText primary={item} />
              </MenuItem>
            ))}
            <MenuItem onClick={handleLogout}>
              <ListItemText primary="Logout" />
              <LogoutIcon />
            </MenuItem>
          </MenuList>
          
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<AddIcon />}
          >
            Post
          </Button>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Typography variant="body1" fontWeight="bold">U</Typography>
              </Box>
              <Box>
                <Typography variant="body1" fontWeight="bold">User Name</Typography>
                <Typography variant="body2" color="text.secondary">@username</Typography>
              </Box>
            </Box>
          </Box>
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
        }}
      >
        <Paper square sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Home</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            {["For you", "Following"].map((tab) => (
              <Box
                key={tab}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: tab === "For you" ? 2 : 0,
                  borderColor: 'primary.main',
                }}
              >
                <Typography fontWeight={tab === "For you" ? 'bold' : 'normal'}>{tab}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
        
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'grey.600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography fontWeight="bold">U</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                multiline
                rows={3}
                placeholder="What is happening?!"
                fullWidth
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ color: 'primary.main' }}>
                  {[ChatIcon, LoopIcon, FavoriteIcon, SendIcon].map((Icon, index) => (
                    <IconButton key={index} size="small" sx={{ mr: 1 }}>
                      <Icon fontSize="small" />
                    </IconButton>
                  ))}
                </Box>
                <Button variant="contained" size="small">
                  Post
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Box>
          {tweets.map((tweet) => (
            <Box
              key={tweet.id}
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'grey.600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  <Typography fontWeight="bold">{tweet.name.charAt(0)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography fontWeight="bold">{tweet.name}</Typography>
                    <Typography sx={{ color: 'text.secondary', mx: 1 }}>@{tweet.username}</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>·</Typography>
                    <Typography sx={{ color: 'text.secondary', ml: 1 }}>{tweet.timestamp}</Typography>
                  </Box>
                  <Box sx={{ py: 1 }}>
                    <Typography>{tweet.content}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 300 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <IconButton size="small">
                        <ChatIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">{tweet.comments}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <IconButton size="small">
                        <LoopIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">{tweet.retweets}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <IconButton size="small">
                        <FavoriteIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">{tweet.likes}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
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
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Trends */}
          <Card sx={{ mb: 2 }}>
            <CardHeader title="Trends for you" />
            <List disablePadding>
              {trends.map((trend) => (
                <ListItem key={trend.id} button>
                  <ListItemText
                    primary={`#${trend.title}`}
                    secondary={`${trend.category} · Trending · ${trend.tweets} posts`}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ p: 2 }}>
              <Typography color="primary" sx={{ cursor: 'pointer' }}>
                Show more
              </Typography>
            </Box>
          </Card>
          
          {/* Who to follow */}
          <Card>
            <CardHeader title="Who to follow" />
            <List disablePadding>
              {suggestedFollows.map((user) => (
                <ListItem key={user.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'grey.600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <Typography fontWeight="bold">{user.avatar}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Follow
                  </Button>
                </ListItem>
              ))}
            </List>
            <Box sx={{ p: 2 }}>
              <Typography color="primary" sx={{ cursor: 'pointer' }}>
                Show more
              </Typography>
            </Box>
          </Card>
          
          {/* Footer */}
          <Box sx={{ mt: 2, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {[
                "Terms of Service",
                "Privacy Policy",
                "Cookie Policy",
                "Accessibility",
                "Ads info",
                "More"
              ].map((item) => (
                <Typography
                  key={item}
                  component="a"
                  href="#"
                  sx={{ mr: 1, mb: 1, textDecoration: 'none', color: 'inherit' }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
            <Box sx={{ mt: 1 }}>© 2025 My Company</Box>
          </Box>
        </Box>
      </Box>
      
      {/* Floating action button for mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { md: 'none' },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}