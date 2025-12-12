// src/api/services/Dealsservice.js
import { http } from "../api";

let RESTAURANT_ID = null;

export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

export const getRestaurantId = () => RESTAURANT_ID;

// ✅ NEW: Check admin approval status
export const checkAdminStatus = async () => {
  const { data } = await http.get("/restaurant/admin-status");
  return data;
};

export const getDealDashboardData = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/deal/dashboarddetails`);
  return data;
};

export const getAllDealsForCurrentMonth = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/deal/dashboardFullDeals`);
  return data;
};

export const getAllDealsUsingPortalFilters = async (filters) => {
  const { data } = await http.get("/deal/portal/search", { params: filters });
  return data;
};

export const createNewDeal = async (dealData) => {
  const id = dealData.restaurant_id ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const payload = { ...dealData, restaurant_id: id };
  const { data } = await http.post("/deal", payload);
  return data;
};

export const updateDeal = async (id, payload) => {
  if (!id) throw new Error("deal id is required");
  const { data } = await http.put(`/deal/${id}`, payload);
  return data;
};

export const deleteDeal = async (id) => {
  if (!id) throw new Error("deal id is required");
  const { data } = await http.delete(`/deal/delete/${id}`);
  return data;
};
