import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth-storage");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error("Access denied");
    } else if (error.response?.status >= 500) {
      // Server error
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const gamesAPI = {
  getGames: () => api.get("/games"),
  getGame: (gameType) => api.get(`/games/${gameType}`),
  startGame: (gameType, options) =>
    api.post(`/games/${gameType}/start`, options),
  submitResult: (gameType, result) =>
    api.post(`/games/${gameType}/submit`, result),
};

export const resultsAPI = {
  getUserResults: (gameType, limit) =>
    api.get(`/results/user/${gameType}?limit=${limit || 20}`),
  getLeaderboard: (gameType, limit) =>
    api.get(`/results/leaderboard/${gameType}?limit=${limit || 10}`),
  getUserStats: () => api.get("/results/stats"),
  getProgress: (gameType) => api.get(`/results/progress/${gameType}`),
};

export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getUsers: (page, limit) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getGameAnalytics: (gameType) => api.get(`/admin/analytics/${gameType}`),
  getSystemStats: () => api.get("/admin/system"),
};

export default api;
