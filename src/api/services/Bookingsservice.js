// src/api/services/Bookingsservice.js
import { http } from "../api";

let RESTAURANT_ID = null;

export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

export const getRestaurantId = () => RESTAURANT_ID;

export const fetchBookingDashboardData = async (restaurantId) => {
  const id = restaurantId ?? RESTAURANT_ID;
  if (!id) throw new Error("restaurantId is required");
  const { data } = await http.get(`/booking/${id}/dashboard`);
  return data;
};
