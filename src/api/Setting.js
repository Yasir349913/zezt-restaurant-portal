// src/api/Setting.js
import { authApi } from "./api"; // uses baseURL: http://localhost:5000/api

/**
 * GET /restaurant/profile
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
 * POST /restaurant (create restaurant)
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

/**
 * PUT /restaurant (update restaurant)
 * Expects backend response: { success, message, restaurant }
 * Note: backend finds restaurant by ownerId from token
 */
export const updateRestaurantProfile = async (payload) => {
  try {
    const res = await authApi.put("/restaurant/profile", payload);
    return res.data; // { success, message, restaurant }
  } catch (err) {
    throw err.response?.data || { message: "Failed to update restaurant" };
  }
};
