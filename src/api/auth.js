// src/services/userService.js
import { userApi, authApi, verify } from "./api";
import {
  attachTokenToApis,
  storeRefreshToken,
  clearClientAuth,
} from "../api/authHelpers";

/* Register Customer */
export const registerCustomer = async (data) => {
  try {
    const res = await userApi.post("/customer", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Register Restaurant Owner */
export const registerRestaurantOwner = async (data) => {
  try {
    const res = await userApi.post("/user/restaurant-owner", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Login: save accessToken + refreshToken based on user role */
export const loginUser = async (data) => {
  try {
    const res = await authApi.post("/authenticate", data);

    // Backend returns different response structure based on role
    // For customers: { success, access_token, refresh_token, user }
    // For restaurant owners: { success, accessToken, user } (refresh token in cookie)

    const {
      accessToken,
      access_token,
      refreshToken,
      refresh_token,
      user,
      success,
    } = res.data || {};

    // Handle both naming conventions
    const token = accessToken || access_token;
    const refresh = refreshToken || refresh_token;

    // Store access token and attach to API instances
    if (token) {
      console.log("📝 Storing access token");
      attachTokenToApis(token);
      localStorage.setItem("token", token);
    }

    // Store user information
    if (user) {
      console.log("👤 Storing user info:", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // For customers, store refresh token in localStorage
      // For restaurant owners, it's in httpOnly cookie
      if (user.role === "customer" && refresh) {
        console.log("📱 Storing refresh token for customer");
        localStorage.setItem("refreshToken", refresh);
      } else if (user.role !== "customer") {
        console.log("🍪 Restaurant owner - refresh token in httpOnly cookie");
      }
    }

    return res.data;
  } catch (err) {
    console.error("❌ Login error:", err.response?.data);
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Forgot Password */
export const forgetPassword = async (data) => {
  try {
    const res = await verify.post("/forgot-password", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Verify Email/Code */
export const verifyEmail = async (data) => {
  try {
    const res = await verify.post("/verify-code", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Resend Verification Code */
export const resendCode = async (data) => {
  try {
    const res = await verify.post("/resend-code", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Reset Password */
export const resetPassword = async (data) => {
  try {
    const res = await verify.post("/reset-password", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Logout: Handle both customer and restaurant owner logout */
export const logoutUserApi = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isCustomer = user.role === "customer";

    // For customers, get refresh token from localStorage
    // For restaurant owners, cookie will be sent automatically
    if (isCustomer) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        console.log("📱 Customer logout - sending refresh token");
        // Send refresh token in request body for customers
        const res = await authApi.post(
          "/user/logout",
          { refreshToken }, // Send in body for customers
          {
            withCredentials: true,
          }
        );
        clearClientAuth();
        return res.data;
      } else {
        console.log("📱 No refresh token found for customer");
        clearClientAuth();
        return { message: "Logged out locally (no refresh token)" };
      }
    } else {
      // Restaurant owner - cookie will be sent automatically
      console.log("🍪 Restaurant owner logout - cookie will be sent");
      try {
        const res = await authApi.post(
          "/user/logout",
          {}, // Empty body for restaurant owners
          {
            withCredentials: true, // This ensures cookie is sent
          }
        );
        clearClientAuth();
        return res.data;
      } catch (err) {
        // Even if backend fails, clear client state
        clearClientAuth();
        return { message: "Logged out locally" };
      }
    }
  } catch (err) {
    console.error("❌ Logout error:", err);
    // On any error, still clear client state to log user out locally
    clearClientAuth();

    // Return success even if backend call failed (user is logged out locally)
    return {
      message: "Logged out locally",
      error: err.response?.data || "Backend logout failed",
    };
  }
};

/* Refresh Token - Manual refresh if needed */
export const refreshAccessToken = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isCustomer = user.role === "customer";

    let requestBody = {};

    // For customers, include refresh token in body
    if (isCustomer) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      requestBody = { refreshToken };
      console.log("📱 Manual refresh for customer");
    } else {
      console.log("🍪 Manual refresh for restaurant owner");
    }

    // Call refresh endpoint
    const res = await authApi.post("/user/refresh", requestBody, {
      withCredentials: true, // Ensures cookies are sent
    });

    const { accessToken, token } = res.data || {};
    const newToken = accessToken || token;

    if (newToken) {
      console.log("✅ Manual refresh successful");
      attachTokenToApis(newToken);
      localStorage.setItem("token", newToken);
    }

    return res.data;
  } catch (err) {
    console.error("❌ Manual refresh failed:", err);
    throw err.response?.data || { error: "Token refresh failed" };
  }
};

/* Get Current User from localStorage */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Error parsing user data:", err);
    return null;
  }
};

/* Check if user is authenticated */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

/* Get user role */
export const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role || null;
  } catch (err) {
    return null;
  }
};
