// Utility functions for authentication

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const login = (token, username = null) => {
  localStorage.setItem('token', token);
  if (username) {
    localStorage.setItem('username', username);
  }
  // Dispatch a custom event to notify other parts of the app
  window.dispatchEvent(new Event('storage'));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  // Dispatch a custom event to notify other parts of the app
  window.dispatchEvent(new Event('storage'));
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { 'Authorization': `Token ${token}` } : {};
};