// Utility functions for API calls

import { getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL + 'settings';

export const apiHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {})
  };
};

export const fetchUserSettings = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${username}/`, {
      method: 'GET',
      headers: apiHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settingsData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify(settingsData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/update/`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};