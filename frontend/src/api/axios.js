import axios from "axios";

// Axios instance pointing at the backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:5000/api
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hrms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid — clear auth and send to login
    if (error.response?.status === 401) {
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
