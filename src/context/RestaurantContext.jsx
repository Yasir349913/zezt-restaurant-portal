// src/context/RestaurantContext.jsx - UPDATE
import React, { createContext, useState, useContext, useEffect } from "react";
import { setRestaurantId as setDashboardServiceRestaurantId } from "../api/Dashbord";
import { setRestaurantId as setDealsServiceRestaurantId } from "../api/services/Dealsservice";
import { setRestaurantId as setAnalyticsServiceRestaurantId } from "../api/services/Analyticsservice";
import { setRestaurantId as setStripeServiceRestaurantId } from "../api/services/Stripeservices";
import { setRestaurantId as setRevenueServiceRestaurantId } from "../api/services/Revenueservices";
import { setRestaurantId as setOccupancyServiceRestaurantId } from "../api/services/Occupancyservices";
import { setRestaurantId as setHotKeysServiceRestaurantId } from "../api/services/Hotdealservice"; // NEW

const RestaurantContext = createContext({
  restaurantId: null,
  setRestaurantId: () => {},
});

export const RestaurantProvider = ({ children }) => {
  const [restaurantId, setRestaurantIdState] = useState(() => {
    try {
      const saved = localStorage.getItem("restaurantId");
      return saved || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (restaurantId) {
        localStorage.setItem("restaurantId", restaurantId);
      } else {
        localStorage.removeItem("restaurantId");
      }
    } catch (err) {}

    // Sync all services with current restaurant ID
    setDashboardServiceRestaurantId(restaurantId);
    setDealsServiceRestaurantId(restaurantId);
    setAnalyticsServiceRestaurantId(restaurantId);
    setStripeServiceRestaurantId(restaurantId);
    setRevenueServiceRestaurantId(restaurantId);
    setOccupancyServiceRestaurantId(restaurantId);
    setHotKeysServiceRestaurantId(restaurantId); // NEW
  }, [restaurantId]);

  const setRestaurantId = (id) => {
    const finalId = id ?? null;
    setRestaurantIdState(finalId);

    try {
      if (finalId) {
        localStorage.setItem("restaurantId", finalId);
      } else {
        localStorage.removeItem("restaurantId");
      }
    } catch (err) {}

    setDashboardServiceRestaurantId(finalId);
    setDealsServiceRestaurantId(finalId);
    setAnalyticsServiceRestaurantId(finalId);
    setStripeServiceRestaurantId(finalId);
    setRevenueServiceRestaurantId(finalId);
    setOccupancyServiceRestaurantId(finalId);
    setHotKeysServiceRestaurantId(finalId); // NEW
  };

  return (
    <RestaurantContext.Provider value={{ restaurantId, setRestaurantId }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
};

export default RestaurantContext;
