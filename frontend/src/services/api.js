import axios from 'axios';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const authService = {
  register: async (email, password) => {
    try {
      const res = await api.post('/auth/register', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  deleteAccount: async () => {
    try {
      const res = await api.delete('/auth/delete-account');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return res.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateTheme: async (theme) => {
    try {
      const res = await api.put('/auth/theme', { theme });
      // Update the user in localStorage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, theme: res.data.user.theme };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      // Also update the token in localStorage if it contains the theme
      const token = localStorage.getItem('token');
      if (token) {
        // This is a simplified approach. Ideally, you would get a new token from the backend.
        // For now, we assume the frontend can update the theme in the context
        // and the backend has saved it for the next login.
      }
      return res.data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },
};

export default authService;
