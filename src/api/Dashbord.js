// src/api/services/Dashboardservice.js
import { http } from "./api";

// Single source of truth (you can remove DEFAULT_RESTAURANT_ID if you don't want a fallback)
const DEFAULT_RESTAURANT_ID = null; // set to null so nothing is hardcoded

let RESTAURANT_ID = DEFAULT_RESTAURANT_ID;

/**
 * Set the module-level restaurant id (call from React context when it changes)
 * @param {string|null} id
 */
export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

/** Get the current module-level restaurant id */
export const getRestaurantId = () => RESTAURANT_ID;

/**
 * Fetch dashboard data for a restaurant.
 * Pass restaurantId explicitly or rely on module-level RESTAURANT_ID.
 * @param {string} restaurantId
 */
export const getDashboardData = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/restaurant/dashboard`);
  return data;
};
