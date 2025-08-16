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
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  
  // State for each tab
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    sex: "male",
  });
  
  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    timezone: "UTC-7",
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    profileVisibility: "public",
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

  const tabLabels = {
    profile: "Profile",
    display: "Display",
    privacy: "Privacy"
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Vertical Tabs */}
        <Box sx={{ width: 200, flexShrink: 0 }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textTransform: 'none',
                fontWeight: activeTab === "profile" ? 'bold' : 'normal'
              }
            }}
          >
            {Object.entries(tabLabels).map(([key, label]) => (
              <Tab 
                key={key} 
                value={key} 
                label={label}
                sx={{ 
                  alignItems: 'flex-start',
                  textTransform: 'none',
                  fontWeight: activeTab === key ? 'bold' : 'normal'
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, maxWidth: 600 }}>
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Box>
              <Typography variant="h5" gutterBottom>Profile Settings</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={profileSettings.firstName}
                  onChange={handleProfileChange}
                  fullWidth
                />
                
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={profileSettings.lastName}
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
                  label="Email"
                  name="email"
                  value={profileSettings.email}
                  onChange={handleProfileChange}
                  fullWidth
                />
                
                <FormControl fullWidth>
                  <InputLabel>Sex</InputLabel>
                  <Select
                    name="sex"
                    value={profileSettings.sex}
                    onChange={handleProfileChange}
                    label="Sex"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}

          {/* Display Settings */}
          {activeTab === "display" && (
            <Box>
              <Typography variant="h5" gutterBottom>Display Settings</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                <TextField
                  label="Timezone (UTC)"
                  name="timezone"
                  value={displaySettings.timezone}
                  onChange={handleDisplayChange}
                  helperText="Enter your timezone in UTC format (e.g., UTC-5, UTC+1)"
                  fullWidth
                />
              </Box>
            </Box>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <Box>
              <Typography variant="h5" gutterBottom>Privacy Settings</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        name="showEmail"
                        checked={privacySettings.showEmail}
                        onChange={handlePrivacyChange}
                      />
                    }
                    label="Show email on profile"
                  />
                </FormGroup>
                
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
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Container>
  );
}