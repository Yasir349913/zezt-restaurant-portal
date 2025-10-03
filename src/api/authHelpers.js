// src/api/authHelpers.js
import { userApi, authApi, verify } from "./api";

/**
 * Attach access token to axios instances:
 *  - x-auth-token: <raw access token>
 *  - Authorization: Bearer <access token>
 */
export const attachTokenToApis = (accessToken) => {
  if (accessToken) {
    const bearer = `Bearer ${accessToken}`;
    [userApi, authApi, verify].forEach((instance) => {
      instance.defaults.headers.common["Authorization"] = bearer;
      instance.defaults.headers.common["x-auth-token"] = accessToken;
    });
    try {
      localStorage.setItem("token", accessToken);
    } catch (err) {
      console.warn("Failed to store token in localStorage", err);
    }
  } else {
    [userApi, authApi, verify].forEach((instance) => {
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

/** store refresh token separately (raw string) */
export const storeRefreshToken = (refreshToken) => {
  try {
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");
  } catch (err) {
    console.warn("Failed to set refreshToken", err);
  }
};

/** Remove all client-side auth state (call on logout) */
export const clearClientAuth = () => {
  attachTokenToApis(null);
  storeRefreshToken(null);
  try {
    localStorage.removeItem("user");
  } catch (e) {}
};

/** Initialize axios defaults from storage (call once at app startup) */
export const initAuthFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) attachTokenToApis(token);
  } catch (err) {
    /* ignore */
  }
};
