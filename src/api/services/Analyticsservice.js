// src/api/services/Analyticsservice.js
import { http } from "../api";

let RESTAURANT_ID = null;

/**
 * Set the restaurantId (used when no id is passed explicitly).
 */
export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

export const getRestaurantId = () => RESTAURANT_ID;

/**
 * Get monthly booking & deal analytics for a restaurant
 * GET /deal/:restaurantId/analytics
 */
export const getMonthlyStats = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/restaurant/${id}/analytics`);
  return data;
};

/**
 * Get current week deal performance comparison
 * GET /deal/:restaurantId/dealComparison
 */
export const getRestaurantDealsPerformance = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/restaurant/${id}/dealComparison`);
  return data;
};

/**
 * Get monthly ratings for all deals of the restaurant
 * GET /deal/:restaurantId/monthlyRating
 */
export const getMonthlyDealRating = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/restaurant/${id}/monthlyRating`);
  return data;
};
