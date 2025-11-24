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

/** Store refresh token for customers
 * Note: This function is kept for backward compatibility but not used
 * The loginUser function handles refresh token storage directly
 */
export const storeRefreshToken = (refreshToken, userRole) => {
  // Only store for customers (restaurant owners use httpOnly cookie)
  if (userRole === "customer" && refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
    console.log("[storeRefreshToken] Stored refresh token for customer");
  } else {
    console.log(
      "[storeRefreshToken] Skipped - restaurant owner uses httpOnly cookie"
    );
  }
};

/** Remove all client-side auth state */
export const clearClientAuth = () => {
  attachTokenToApis(null);
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    // Also remove any restaurant-related data
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("selectedRestaurant");
  } catch (e) {
    console.error("Error clearing auth:", e);
  }
};

/** Initialize axios defaults from storage */
export const initAuthFromStorage = () => {
  console.log("[initAuthFromStorage] Initializing...");
  try {
    const token = localStorage.getItem("token");
    console.log("[initAuthFromStorage] Token found:", token ? "YES" : "NO");
    if (token) {
      attachTokenToApis(token);
    }
  } catch (err) {
    console.error("[initAuthFromStorage] Error:", err);
  }
};
