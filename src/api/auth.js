// src/services/userService.js
import { userApi, authApi, verify } from "./api";
import {
  attachTokenToApis,
  storeRefreshToken,
  clearClientAuth,
} from "../api/authHelpers";

/* registerCustomer / registerRestaurantOwner unchanged */
export const registerCustomer = async (data) => {
  try {
    const res = await userApi.post("/customer", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};
export const registerRestaurantOwner = async (data) => {
  try {
    const res = await userApi.post("/restaurant-owner", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Login: save accessToken + refreshToken (if backend returns them) */
export const loginUser = async (data) => {
  try {
    const res = await authApi.post("/authenticate", data);
    // expect: { accessToken, refreshToken, user? } (if backend returns)
    const { accessToken, refreshToken } = res.data || {};

    if (accessToken) attachTokenToApis(accessToken);
    if (refreshToken) storeRefreshToken(refreshToken);

    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "something went wrong" };
  }
};

/* Existing helpers (forgetPassword, verifyEmail...) keep them as is */
export const forgetPassword = async (data) => {
  try {
    const res = await verify.post("/forgot-password", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "something went wrong" };
  }
};
export const verifyEmail = async (data) => {
  try {
    const res = await verify.post("/verify-code", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "esomething went erong" };
  }
};
export const resendCode = async (data) => {
  try {
    const res = await verify.post("/resend-code", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};
export const resetPassword = async (data) => {
  try {
    const res = await verify.post("/reset-password", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Something went wrong" };
  }
};

/* Logout: try to inform backend (if you have refreshToken), but always clear client state */
export const logoutUserApi = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      // No refresh token client-side: still clear client auth and return
      clearClientAuth();
      return { message: "No refresh token client-side; cleared auth" };
    }

    // Try to call backend logout; if backend ignores header it's fine.
    const res = await authApi.post(
      "/user/logout",
      {}, // empty body
      {
        headers: {
          "x-auth-token": refreshToken,
        },
      }
    );

    // Regardless of response, clear client auth
    clearClientAuth();
    return res.data;
  } catch (err) {
    // On any error, still clear client state to log user out locally
    clearClientAuth();
    // Re-throw normalized error so caller can show message if desired
    throw (
      err.response?.data || { error: "Logout failed (client cleared auth)" }
    );
  }
};
