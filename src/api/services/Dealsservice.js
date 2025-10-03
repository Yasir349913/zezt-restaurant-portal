// src/api/services/Dealsservice.js
import { http } from "../api";

let RESTAURANT_ID = null;

export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

export const getRestaurantId = () => RESTAURANT_ID;

export const getDealDashboardData = async (restaurantId) => {
  console.log(restaurantId);
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/deal/${id}/dashboarddetails`);
  console.log(data);
  return data;
};
export const getAllDealsForCurrentMonth = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/deal/${id}/dashboardFullDeals`);
  return data;
};

export const getAllDealsUsingPortalFilters = async (filters) => {
  const { data } = await http.get("/deal/portal/search", { params: filters });
  return data;
};

export const createNewDeal = async (dealData) => {
  console.log(dealData.restaurant_id);
  const id = dealData.restaurant_id ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const payload = { ...dealData, restaurant_id: id };
  const { data } = await http.post("/deal", payload);
  return data;
};
