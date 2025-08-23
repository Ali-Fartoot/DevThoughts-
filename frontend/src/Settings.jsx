import React, { useState, useEffect, useRef } from "react";
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
  Paper,
  IconButton,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
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
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [existingProfilePicture, setExistingProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

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
        // Use the username-specific endpoint for fetching settings
        let settingsUrl = `/api/settings/${username}/`;
        
        const response = await fetch(settingsUrl, {
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
        
        // Load existing profile picture
        loadProfilePicture();
      } catch (err) {
        setError("Failed to load settings: " + err.message);
        console.error("Error loading user settings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSettings();
    
    // Cleanup object URLs when component unmounts
    return () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
      }
      if (existingProfilePicture) {
        URL.revokeObjectURL(existingProfilePicture);
      }
    };
  }, [username]); // Removed profilePicturePreview and existingProfilePicture from dependency array
  
  const loadProfilePicture = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }
      
      // For current user, don't pass ID parameter - backend will use request.user.id
      const response = await fetch('http://localhost:8000/api/accounts/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(await response.blob());
        setExistingProfilePicture(imageUrl);
      } else if (response.status === 404) {
        // No profile picture found - this is normal, clear any existing picture
        setExistingProfilePicture(null);
      }
    } catch (err) {
      console.log("Error fetching profile picture for user");
      setExistingProfilePicture(null);
    }
  };

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
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };
  
  const handleUploadProfilePicture = async () => {
    if (!profilePicture) return;
    
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }
      
      const formData = new FormData();
      formData.append('file', profilePicture);
      
      const response = await fetch('http://localhost:8000/api/accounts/profile/put/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        setSuccess(true);
        setProfilePicture(null);
        setProfilePicturePreview(null);
        // Reload the profile picture
        loadProfilePicture();
      } else {
        throw new Error("Failed to upload profile picture");
      }
    } catch (err) {
      setError("Failed to upload profile picture: " + err.message);
      console.error("Error uploading profile picture:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteProfilePicture = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("User not authenticated");
      }
      
      const response = await fetch('http://localhost:8000/api/accounts/profile/put/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
      
      if (response.ok) {
        setSuccess(true);
        setExistingProfilePicture(null);
        setProfilePicturePreview(null);
      } else {
        throw new Error("Failed to delete profile picture");
      }
    } catch (err) {
      setError("Failed to delete profile picture: " + err.message);
      console.error("Error deleting profile picture:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const tabLabels = {
    profile: "Profile",
    display: "Display",
    privacy: "Privacy"
  };

  return (
    <Box sx={{ bgcolor: '#000', color: '#fff', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Settings
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/user/${username}`)}
            sx={{ 
              mt: 2,
              borderColor: '#1d9bf0',
              color: '#1d9bf0',
              '&:hover': {
                borderColor: '#1a8cd8',
              }
            }}
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
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, bgcolor: '#ff3333', color: '#fff' }}>
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
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', bgcolor: '#1d9bf0', color: '#fff' }}>
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
                  borderColor: '#2f3336',
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: '#1d9bf0',
                      fontWeight: 'bold',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1d9bf0',
                  }
                }}
              >
                {Object.entries(tabLabels).map(([key, label]) => (
                  <Tab 
                    key={key} 
                    value={key} 
                    label={label}
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
                      InputLabelProps={{ style: { color: '#fff' } }}
                      inputProps={{ style: { color: '#fff' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}
                    />
                    
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={profileSettings.lastName}
                      onChange={handleProfileChange}
                      fullWidth
                      InputLabelProps={{ style: { color: '#fff' } }}
                      inputProps={{ style: { color: '#fff' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}
                    />
                    
                    <TextField
                      label="Username"
                      name="username"
                      value={profileSettings.username}
                      onChange={handleProfileChange}
                      fullWidth
                      error={!!fieldErrors.username}
                      helperText={fieldErrors.username || ""}
                      InputLabelProps={{ style: { color: '#fff' } }}
                      inputProps={{ style: { color: '#fff' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}
                    />
                    
                    <TextField
                      label="Email"
                      name="email"
                      value={profileSettings.email}
                      onChange={handleProfileChange}
                      fullWidth
                      InputLabelProps={{ style: { color: '#fff' } }}
                      inputProps={{ style: { color: '#fff' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}
                    />
                    
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}>
                      <InputLabel sx={{ color: '#fff' }}>Sex</InputLabel>
                      <Select
                        name="sex"
                        value={profileSettings.sex}
                        onChange={handleProfileChange}
                        label="Sex"
                        sx={{ color: '#fff' }}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {/* Profile Picture Section */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>Profile Picture</Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {/* Profile Picture Preview */}
                        <Paper 
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#1e1e2e'
                          }}
                        >
                          {profilePicturePreview ? (
                            <img 
                              src={profilePicturePreview} 
                              alt="Preview" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : existingProfilePicture ? (
                            <img 
                              src={existingProfilePicture} 
                              alt="Profile" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <Typography color="text.secondary">No Image</Typography>
                          )}
                        </Paper>
                        
                        <Box>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            style={{ display: 'none' }}
                          />
                          
                          <Button
                            variant="outlined"
                            startIcon={<PhotoCameraIcon />}
                            onClick={triggerFileInput}
                            sx={{
                              borderColor: '#1d9bf0',
                              color: '#1d9bf0',
                              '&:hover': {
                                borderColor: '#1a8cd8',
                              },
                              mr: 2
                            }}
                          >
                            Upload Picture
                          </Button>
                          
                          {(profilePicturePreview || existingProfilePicture) && (
                            <IconButton
                              onClick={handleDeleteProfilePicture}
                              sx={{ 
                                color: '#ff5252',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 82, 82, 0.1)'
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                          
                          {profilePicturePreview && (
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                onClick={handleUploadProfilePicture}
                                sx={{
                                  bgcolor: '#1d9bf0',
                                  '&:hover': {
                                    bgcolor: '#1a8cd8',
                                  }
                                }}
                              >
                                Save Picture
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
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
                      InputLabelProps={{ style: { color: '#fff' } }}
                      inputProps={{ style: { color: '#fff' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}
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
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#1d9bf0' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1d9bf0' } }}
                          />
                        }
                        label="Show email on profile"
                      />
                    </FormGroup>
                    
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2f3336' } } }}>
                      <InputLabel sx={{ color: '#fff' }}>Profile Visibility</InputLabel>
                      <Select
                        name="profileVisibility"
                        value={privacySettings.profileVisibility}
                        onChange={handlePrivacyChange}
                        label="Profile Visibility"
                        sx={{ color: '#fff' }}
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
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={loading}
            sx={{
              bgcolor: '#1d9bf0',
              '&:hover': {
                bgcolor: '#1a8cd8',
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
