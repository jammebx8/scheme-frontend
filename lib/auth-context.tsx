"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, users, UserProfile } from "./api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("govassist_token");
    if (savedToken) {
      setToken(savedToken);
      users
        .getProfile()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("govassist_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login({ email, password });
    localStorage.setItem("govassist_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    const res = await auth.signup(data);
    localStorage.setItem("govassist_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("govassist_token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await users.getProfile();
      setUser(u);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
