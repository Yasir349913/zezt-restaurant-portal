// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/auth";
import { clearClientAuth } from "../api/authHelpers";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Initialize from localStorage on app start
  useEffect(() => {
    console.log("[AuthContext] Initializing...");
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        console.log("[AuthContext] Token found");
        setToken(storedToken);
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("[AuthContext] User found:", parsedUser.role);
          setUser(parsedUser);
        } catch {
          console.error("[AuthContext] Failed to parse user");
          setUser(null);
        }
      }
    } catch (err) {
      console.error("[AuthContext] Initialization error:", err);
    } finally {
      setReady(true);
      console.log("[AuthContext] Ready");
    }
  }, []);

  // Listen for token expiry events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log("[AuthContext] Token expired event received");
      logout();
      window.location.href = "/login";
    };

    window.addEventListener("token-expired", handleTokenExpired);
    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ email, password }) => {
    try {
      console.log("[AuthContext] Login attempt");
      const res = await loginUser({ email, password });

      // Extract token and user
      const t = res?.accessToken || res?.access_token;
      const u = res?.user;

      if (!t || !u) {
        console.error("[AuthContext] Missing token or user in response");
        return {
          ok: false,
          error: "Login failed - missing credentials",
        };
      }

      console.log("[AuthContext] Login successful");
      setToken(t);
      setUser(u);

      return { ok: true, data: { user: u, token: t } };
    } catch (err) {
      console.error("[AuthContext] Login error:", err);
      const e = err?.response?.data || err;
      return {
        ok: false,
        error: e?.message || e?.error || "Login failed",
        raw: e,
      };
    }
  };

  const logout = () => {
    console.log("[AuthContext] Logout");
    clearClientAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, ready, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
