import React, { useState, useEffect } from "react";
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
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from './auth';
import { fetchUserSettings, updateUserSettings, updateUserProfile } from './api';

export default function Settings() {
  const navigate = useNavigate();
  const { username } = useParams();
  
  // State for each tab
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    sex: "",
  });
  
  // Display settings state
  const [displaySettings, setDisplaySettings] = useState({
    timezone: "",
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    profileVisibility: "public",
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // State for field-specific errors

  // Load user settings when component mounts
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          throw new Error("User not authenticated");
        }
        
        if (!username) {
          throw new Error("Username not provided");
        }
        
        // Fetch user data from accounts API
        const userResponse = await fetch(`/api/user/${username}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        
        // Fetch settings data from settings API using the GET method
        const response = await fetch(`/api/settings/${username}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const settingsData = await response.json();
        
        // Map API response to component state
        setProfileSettings({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          username: userData.username || "",
          email: userData.email || "",
          sex: userData.sex || "",
        });
        
        setDisplaySettings({
          timezone: settingsData.timezone || "UTC",
        });
        
        setPrivacySettings({
          showEmail: settingsData.show_email || false,
          profileVisibility: settingsData.profile_visibility || "public",
        });
      } catch (err) {
        setError("Failed to load settings: " + err.message);
        console.error("Error loading user settings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSettings();
  }, [username]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear the specific field error when the user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
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

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setFieldErrors({}); // Clear previous field errors
      const token = getToken();
      
      // This structure now matches the refactored SettingsSerializer
      const updateData = {
        user: {
          username: profileSettings.username,
          first_name: profileSettings.firstName,
          last_name: profileSettings.lastName,
          email: profileSettings.email,
        },
        sex: profileSettings.sex,
        timezone: displaySettings.timezone,
        show_email: privacySettings.showEmail,
        profile_visibility: privacySettings.profileVisibility,
      };
      
      const response = await fetch(`/api/settings/profile/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle nested validation errors from the backend
        if (errorData.user && errorData.user.username) {
          setFieldErrors({ username: errorData.user.username[0] });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSuccess(true);
    } catch (err) {
      setError("Failed to save settings. Please check the fields for errors.");
      console.error("Error saving settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
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
          onClick={() => navigate(`/user/${username}`)}
          sx={{ mt: 2 }}
        >
          Back to Profile
        </Button>
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading settings...</Typography>
        </Box>
      )}

      {/* Error message */}
      {error && !success && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success message */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Settings saved successfully!
        </Alert>
      </Snackbar>

      {!loading && (
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
                    error={!!fieldErrors.username}
                    helperText={fieldErrors.username || ""}
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
                      <MenuItem value="friends">Followers Only</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Save Changes
        </Button>
      </Box>
    </Container>
  );
}
