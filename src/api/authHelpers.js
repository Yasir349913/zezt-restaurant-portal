// src/api/authHelpers.js
import { http, userApi, authApi, verify } from "./api";

/**
 * Attach access token to axios instances
 */
export const attachTokenToApis = (accessToken) => {
  console.log(
    "[attachTokenToApis] Attaching token:",
    accessToken ? "YES" : "NO"
  );

  if (accessToken) {
    const bearer = `Bearer ${accessToken}`;
    [http, userApi, authApi, verify].forEach((instance) => {
      instance.defaults.headers.common["Authorization"] = bearer;
      instance.defaults.headers.common["x-auth-token"] = accessToken;
    });

    try {
      localStorage.setItem("token", accessToken);
    } catch (err) {
      console.warn("Failed to store token in localStorage", err);
    }
  } else {
    [http, userApi, authApi, verify].forEach((instance) => {
      delete instance.defaults.headers.common["Authorization"];
      delete instance.defaults.headers.common["x-auth-token"];
    });
    try {
      localStorage.removeItem("token");
    } catch (err) {
      /* ignore */
    }
  }
};

/** Remove refresh token from localStorage (not needed since it's in cookie) */
export const storeRefreshToken = (refreshToken) => {
  // Not needed anymore - refresh token is in httpOnly cookie
  // Keeping this function for backward compatibility
  console.log("[storeRefreshToken] Refresh token stored in httpOnly cookie");
};

/** Remove all client-side auth state */
export const clearClientAuth = () => {
  attachTokenToApis(null);
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  } catch (e) {}
};

/** Initialize axios defaults from storage */
export const initAuthFromStorage = () => {
  console.log("[initAuthFromStorage] Initializing...");
  try {
    const token = localStorage.getItem("token");
    console.log("[initAuthFromStorage] Token found:", token ? "YES" : "NO");
    if (token) attachTokenToApis(token);
  } catch (err) {
    console.error("[initAuthFromStorage] Error:", err);
  }
};
