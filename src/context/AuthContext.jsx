// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../api/auth";
import { attachTokenToApis, initAuthFromStorage } from "../api/authHelpers";

/**
 * AuthContext provides:
 * - auth.user : the logged-in user object (may contain _id, email, role, etc.)
 * - auth.token : raw token string
 * - login(credentials) : performs login, stores token+user
 * - logout() : clears token + user
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // server user object
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false); // for init

  // Initialize from localStorage on app start
  useEffect(() => {
    try {
      initAuthFromStorage(); // sets axios headers if token exists
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

  const login = async ({ email, password }) => {
    // returns { ok: boolean, data, error }
    try {
      const res = await loginUser({ email, password });
      // try to extract token and user from common shapes
      const t =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken ||
        res?.data?.access_token ||
        res?.access_token;

      // user might be returned as res.user or res.data.user or nested.
      const u = res?.user || res?.data?.user || res?.data || null;

      if (!t) {
        return {
          ok: false,
          error: "Login succeeded but server did not return a token.",
        };
      }

      // attach token to axios and persist
      attachTokenToApis(t);
      setToken(t);
      localStorage.setItem("token", t);

      if (u) {
        // keep a minimal user object in storage
        setUser(u);
        try {
          localStorage.setItem("user", JSON.stringify(u));
        } catch (e) {
          console.warn("Failed to persist user", e);
        }
      }

      return { ok: true, data: { user: u, token: t } };
    } catch (err) {
      // Normalize backend error shapes
      const e = err?.response?.data || err;
      return {
        ok: false,
        error: e?.message || e?.error || "Login failed",
        raw: e,
      };
    }
  };

  const logout = () => {
    attachTokenToApis(null);
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
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
