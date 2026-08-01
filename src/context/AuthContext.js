"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Check stored auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (res?.data?.user) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error("Auth check failed:", err.message);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [API_URL]);

  // Login handler
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    if (res.data?.token && res.data?.user) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Register handler
  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, userData);
    if (res.data?.token && res.data?.user) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const getToken = () => {
    return token || localStorage.getItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

