// src/context/RestaurantContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { setRestaurantId as setDashboardServiceRestaurantId } from "../api/dashbord";
import { setRestaurantId as setDealsServiceRestaurantId } from "../api/services/Dealsservice";
import { setRestaurantId as setAnalyticsServiceRestaurantId } from "../api/services/Analyticsservice";

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

    // Sync services
    setDashboardServiceRestaurantId(restaurantId);
    setDealsServiceRestaurantId(restaurantId);
    setAnalyticsServiceRestaurantId(restaurantId);
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

    // Immediately sync services
    setDashboardServiceRestaurantId(finalId);
    setDealsServiceRestaurantId(finalId);
    setAnalyticsServiceRestaurantId(finalId);
  };

  return (
    <RestaurantContext.Provider value={{ restaurantId, setRestaurantId }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => useContext(RestaurantContext);
