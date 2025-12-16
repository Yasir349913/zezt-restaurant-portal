// src/api/userApi.js
import { authApi } from "./api";

/**
 * GET /user/profile
 * Fetch current user profile
 */
export const fetchUserProfile = async () => {
  try {
    const res = await authApi.get("/user/profile");
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Failed to fetch profile" };
  }
};

/**
 * PUT /user/profile
 * Update user profile (firstName, lastName, password)
 */
export const updateUserProfileApi = async (payload) => {
  try {
    const res = await authApi.put("/user/profile", payload);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Failed to update profile" };
  }
};
