// src/api/services/Revenueservices.js
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
 * Get revenue overview for a restaurant
 * GET /restaurant/revenue-overview?restaurantId=xxx&month=YYYYMM
 */
export const getRevenueOverview = async (restaurantId, month) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");

  const params = { restaurantId: id };
  if (month) params.month = month;

  const { data } = await http.get("/restaurant/revenue-overview", { params });
  return data;
};

/**
 * Get billing info for a restaurant
 * GET /restaurant/billing-info?restaurantId=xxx
 */
export const getBillingInfo = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");

  const { data } = await http.get("/restaurant/billing-info", {
    params: { restaurantId: id },
  });
  return data;
};

/**
 * Get invoices for a restaurant
 * GET /restaurant/invoices?restaurantId=xxx&month=YYYYMM
 */
export const getInvoices = async (restaurantId, month) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");

  const params = { restaurantId: id };
  if (month) params.month = month;

  const { data } = await http.get("/restaurant/invoices", { params });
  return data;
};
