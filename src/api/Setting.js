// src/api/Setting.js
import { authApi } from "./api"; // uses baseURL: http://localhost:5000/api

/**
 * GET /profile
 * Expects backend response: { user, restaurant }
 */
export const fetchRestaurantProfile = async () => {
  try {
    const res = await authApi.get("/restaurant/profile");
    return res.data; // { user, restaurant }
  } catch (err) {
    // normalize error shape for frontend
    throw err.response?.data || { message: "Failed to fetch profile" };
  }
};

/**
 * POST /  (create restaurant)
 * Expects backend response: { restaurant, token }
 * Note: backend sets ownerId from token, so do NOT send ownerId in payload.
 */
export const createRestaurantProfile = async (payload) => {
  try {
    const res = await authApi.post("/restaurant", payload);
    return res.data; // { restaurant, token }
  } catch (err) {
    throw err.response?.data || { message: "Failed to create restaurant" };
  }
};
