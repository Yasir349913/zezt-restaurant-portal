// src/services/userService.js
import { userApi, authApi, verify } from "../api/api";
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
    console.log("🔐 Attempting login...");
    const res = await authApi.post("/authenticate", data);

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

    console.log("📊 Login response:", {
      hasToken: !!token,
      hasRefresh: !!refresh,
      hasUser: !!user,
      userRole: user?.role,
    });

    // Store access token and attach to API instances
    if (token) {
      console.log("📝 Storing access token");
      attachTokenToApis(token);
    } else {
      console.error("❌ No access token in response!");
      throw new Error("No access token received");
    }

    // Store user information
    if (user) {
      console.log("👤 Storing user info:", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Use the storeRefreshToken helper function
      storeRefreshToken(refresh, user.role);
    } else {
      console.error("❌ No user in response!");
      throw new Error("No user information received");
    }

    console.log("✅ Login successful");
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

    let requestBody = {};

    if (isCustomer) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        console.log("📱 Customer logout - sending refresh token");
        requestBody = { refreshToken };
      } else {
        console.log("📱 No refresh token found for customer");
      }
    } else {
      console.log("🍪 Restaurant owner logout - cookie will be sent");
    }

    await authApi.post("/user/logout", requestBody, {
      withCredentials: true,
    });

    clearClientAuth();
    console.log("✅ Logout successful");
    return { message: "Logged out successfully" };
  } catch (err) {
    console.error("❌ Logout error:", err);
    clearClientAuth();
    return { message: "Logged out locally" };
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
