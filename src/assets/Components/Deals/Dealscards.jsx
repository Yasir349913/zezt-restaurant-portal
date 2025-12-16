import React, { useState, useEffect } from "react";
import Dealscardlists from "./Dealscardlists";
import { getDealDashboardData } from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Common/Loader";

const Dealscards = ({ refreshTrigger }) => {
  const { restaurantId } = useRestaurant();
  const [dealsData, setDealsData] = useState([
    { name: "Current Month Deals", number: 0, percentage: 0 },
    { name: "Total Redemptions", number: 0, percentage: 0 },
    { name: "Current Month Revenue", number: 0, percentage: 0 },
    { name: "Avg Redemption Rate", number: "0%", percentage: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Check localStorage fallback
    const fallbackId =
      typeof window !== "undefined"
        ? localStorage.getItem("restaurantId")
        : null;
    const idToUse = restaurantId || fallbackId;

    console.log("Fetching dashboard data for restaurant:", idToUse);

    try {
      if (!idToUse) {
        // No restaurant - show default zero values
        console.log("No restaurant ID available - showing default values");
        setDealsData([
          { name: "Current Month Deals", number: 0, percentage: 0 },
          { name: "Total Redemptions", number: 0, percentage: 0 },
          { name: "Current Month Revenue", number: 0, percentage: 0 },
          { name: "Avg Redemption Rate", number: "0%", percentage: 0 },
        ]);
        return;
      }

      const data = await getDealDashboardData(idToUse);
      console.log("Dashboard data received:", data);

      // Match backend response: activeDealsCount, totalRedemptions, totalRevenue, avgRedemptionRate
      const cardsArray = [
        {
          name: "Current Month Deals",
          number: data.activeDealsCount || 0,
          percentage: 0,
        },
        {
          name: "Total Redemptions",
          number: data.totalRedemptions || 0,
          percentage: 0,
        },
        {
          name: "Current Month Revenue",
          number: data.totalRevenue || 0,
          percentage: 0,
        },
        {
          name: "Avg Redemption Rate",
          number: data.avgRedemptionRate || "0%",
          percentage: 0,
        },
      ];

      setDealsData(cardsArray);
      console.log("Cards data set:", cardsArray);
    } catch (err) {
      console.error("Failed to fetch dashboard deals:", err);
      console.error("Error details:", err.response?.data);

      // Even on error, show zero values instead of error message
      setDealsData([
        { name: "Current Month Deals", number: 0, percentage: 0 },
        { name: "Total Redemptions", number: 0, percentage: 0 },
        { name: "Current Month Revenue", number: 0, percentage: 0 },
        { name: "Avg Redemption Rate", number: "0%", percentage: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "Dealscards useEffect triggered. RestaurantId:",
      restaurantId,
      "RefreshTrigger:",
      refreshTrigger
    );
    fetchDashboardData();
  }, [restaurantId, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="md" text="Loading deals data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Deals Cards Only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[21px]">
        {dealsData.map((item, index) => (
          <Dealscardlists
            key={index}
            name={item.name}
            number={item.number}
            percentage={item.percentage}
          />
        ))}
      </div>
    </div>
  );
};

export default Dealscards;
