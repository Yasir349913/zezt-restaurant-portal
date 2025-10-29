// src/api/services/Occupancyservices.js
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
 * Get complete capacity dashboard data including warnings, utilization, and recommendations
 * GET /api/capacity/overview/:restaurantId
 */
export const getCapacityOverview = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/capacity/overview/${id}`);
  return data;
};

/**
 * Get list of all time slots where capacity is exceeded
 * GET /api/capacity/warnings/:restaurantId
 */
export const getCapacityWarnings = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/capacity/warnings/${id}`);
  return data;
};

/**
 * Get statistical analysis of capacity usage over a date range
 * GET /api/capacity/utilization/:restaurantId
 * @param {string} startDate - Optional ISO date string (default: today)
 * @param {string} endDate - Optional ISO date string (default: 30 days from now)
 */
export const getCapacityUtilization = async (
  restaurantId,
  startDate,
  endDate
) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");

  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await http.get(`/capacity/utilization/${id}`, { params });
  return data;
};

/**
 * Get hour-by-hour capacity data for visualization
 * GET /api/capacity/timeline/:restaurantId
 * @param {string} startDate - Optional ISO date string (default: today)
 * @param {string} endDate - Optional ISO date string (default: 14 days from now)
 */
export const getCapacityTimeline = async (restaurantId, startDate, endDate) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");

  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await http.get(`/capacity/timeline/${id}`, { params });
  return data;
};

/**
 * Update the total seating capacity for a restaurant
 * PATCH /api/capacity/update/:restaurantId
 * @param {number} totalCapacity - New total seating capacity
 */
export const updateRestaurantCapacity = async (restaurantId, totalCapacity) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  if (!totalCapacity) throw new Error("totalCapacity is required");

  const { data } = await http.patch(`/capacity/update/${id}`, {
    total_capacity: totalCapacity,
  });
  return data;
};
