// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/auth";
import {
  attachTokenToApis,
  initAuthFromStorage,
  clearClientAuth,
} from "../api/authHelpers";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Initialize from localStorage on app start
  useEffect(() => {
    try {
      initAuthFromStorage();
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken) setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    } finally {
      setReady(true);
    }
  }, []);

  // Listen for token expiry events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log("[AuthContext] Token expired, logging out...");
      logout();
      // Optionally redirect to login
      window.location.href = "/login";
    };

    window.addEventListener("token-expired", handleTokenExpired);
    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await loginUser({ email, password });

      // Extract access token
      const t =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken;

      // Extract user
      const u = res?.user || res?.data?.user || res?.data || null;

      if (!t) {
        return {
          ok: false,
          error: "Login succeeded but server did not return a token.",
        };
      }

      // Attach token to axios and persist
      attachTokenToApis(t);
      setToken(t);
      localStorage.setItem("token", t);

      if (u) {
        setUser(u);
        try {
          localStorage.setItem("user", JSON.stringify(u));
        } catch (e) {
          console.warn("Failed to persist user", e);
        }
      }

      console.log("✅ Login successful - refresh token stored in cookie");
      return { ok: true, data: { user: u, token: t } };
    } catch (err) {
      const e = err?.response?.data || err;
      return {
        ok: false,
        error: e?.message || e?.error || "Login failed",
        raw: e,
      };
    }
  };

  const logout = () => {
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
