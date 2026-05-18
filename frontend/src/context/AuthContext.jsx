import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import getFileUrl from "../utils/getFileUrl"; // eslint-disable-line no-unused-vars

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // loading starts true so ProtectedRoute waits for the initial token check
  const [loading, setLoading] = useState(true);

  // On app load: if a token exists, verify it by calling /auth/me
  useEffect(() => {
    const savedToken = localStorage.getItem("hrms_token");
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch the logged-in user from the server (uses token from localStorage via interceptor)
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      // Token is invalid or expired — clear everything
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register a new user — accepts a plain object with { name, email, password, role }
  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login and persist token in localStorage
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem("hrms_token", newToken);
      localStorage.setItem("hrms_user", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Try again.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout and clear all auth state
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
  };

  // Merge partial updates into the current user state (e.g., after profile edit)
  const updateCurrentUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("hrms_user", JSON.stringify(next));
      return next;
    });
  };

  // Upload a new profile picture and sync user state
  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await api.put("/auth/profile-picture", formData);
      const updatedUser = res.data.user;

      setUser((prev) => ({ ...prev, ...updatedUser }));
      localStorage.setItem("hrms_user", JSON.stringify({ ...user, ...updatedUser }));

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Upload failed." };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout, fetchCurrentUser, updateCurrentUser, updateProfilePicture }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
};
