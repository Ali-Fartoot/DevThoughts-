import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  
  // State for each tab
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    name: "John Doe",
    username: "johndoe",
    bio: "Software developer passionate about React and Node.js",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
  });
  
  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    theme: "dark",
    language: "en",
    fontSize: "medium",
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    tweetVisibility: "public",
    showOnlineStatus: true,
    allowMessages: "everyone",
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDisplayChange = (e) => {
    const { name, value } = e.target;
    setDisplaySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = () => {
    // Save logic would go here
    console.log("Settings saved");
    alert("Settings saved successfully!");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back to Profile
        </Button>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {["profile", "display", "privacy"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "contained" : "text"}
              onClick={() => setActiveTab(tab)}
              sx={{ 
                textTransform: 'capitalize',
                fontWeight: activeTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <Box>
          <Typography variant="h5" gutterBottom>Profile Settings</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            <TextField
              label="Name"
              name="name"
              value={profileSettings.name}
              onChange={handleProfileChange}
              fullWidth
            />
            
            <TextField
              label="Username"
              name="username"
              value={profileSettings.username}
              onChange={handleProfileChange}
              fullWidth
            />
            
            <TextField
              label="Bio"
              name="bio"
              value={profileSettings.bio}
              onChange={handleProfileChange}
              multiline
              rows={3}
              fullWidth
            />
            
            <TextField
              label="Location"
              name="location"
              value={profileSettings.location}
              onChange={handleProfileChange}
              fullWidth
            />
            
            <TextField
              label="Website"
              name="website"
              value={profileSettings.website}
              onChange={handleProfileChange}
              fullWidth
            />
          </Box>
        </Box>
      )}

      {/* Display Settings */}
      {activeTab === "display" && (
        <Box>
          <Typography variant="h5" gutterBottom>Display Settings</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                name="theme"
                value={displaySettings.theme}
                onChange={handleDisplayChange}
                label="Theme"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                name="language"
                value={displaySettings.language}
                onChange={handleDisplayChange}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Font Size</InputLabel>
              <Select
                name="fontSize"
                value={displaySettings.fontSize}
                onChange={handleDisplayChange}
                label="Font Size"
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Privacy Settings */}
      {activeTab === "privacy" && (
        <Box>
          <Typography variant="h5" gutterBottom>Privacy Settings</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Profile Visibility</InputLabel>
              <Select
                name="profileVisibility"
                value={privacySettings.profileVisibility}
                onChange={handlePrivacyChange}
                label="Profile Visibility"
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="followers">Followers Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Tweet Visibility</InputLabel>
              <Select
                name="tweetVisibility"
                value={privacySettings.tweetVisibility}
                onChange={handlePrivacyChange}
                label="Tweet Visibility"
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="followers">Followers Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    name="showOnlineStatus"
                    checked={privacySettings.showOnlineStatus}
                    onChange={handlePrivacyChange}
                  />
                }
                label="Show online status"
              />
            </FormGroup>
            
            <FormControl fullWidth>
              <InputLabel>Who can message you</InputLabel>
              <Select
                name="allowMessages"
                value={privacySettings.allowMessages}
                onChange={handlePrivacyChange}
                label="Who can message you"
              >
                <MenuItem value="everyone">Everyone</MenuItem>
                <MenuItem value="followers">Followers Only</MenuItem>
                <MenuItem value="none">No One</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Container>
  );
}