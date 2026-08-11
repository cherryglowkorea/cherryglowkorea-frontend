"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface UserType {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  photoURL?: string;
  savedAddresses?: any[];
  notificationPreferences?: any;
  createdAt?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  getToken: () => string | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setAuthData: (userData: UserType | null, tokenData?: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Check stored auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
        } catch (err: any) {
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
  const login = async (email: string, password?: string) => {
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
  const register = async (userData: any) => {
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
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Helper to directly update auth state (e.g. guest checkout, password creation)
  const setAuthData = (userData: UserType | null, tokenData?: string | null) => {
    if (tokenData) {
      localStorage.setItem("token", tokenData);
      setToken(tokenData);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const getToken = () => {
    return token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        getToken,
        setUser,
        setToken,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
