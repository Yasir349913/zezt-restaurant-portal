// src/components/Analytics/Analyticscards.jsx
import React, { useEffect, useState } from "react";
import Card from "./Card";
import { getMonthlyStats } from "../../../api/services/Analyticsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const Analyticscards = ({ onTabChange }) => {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState("Deal Performance");
  const [analyticsItems, setAnalyticsItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getMonthlyStats(restaurantId);

        console.log("📊 Backend Response:", data);

        // Fixed version based on backend response
        const items = [
          {
            name: "Total Bookings",
            number: data.totalBookings ?? 0,
            percentage: 0,
          },
          {
            name: "Total Redemptions",
            number: data.totalRedemptions ?? 0, // FIXED
            percentage: 0,
          },
          {
            name: "Total Revenue",
            number: `£ ${Number(data.totalRevenue ?? 0).toLocaleString()}`, // FIXED

            percentage: 0,
          },
          {
            name: "Average Rating",
            number: Number(data.averageRating ?? 0).toFixed(1), // FIXED
            percentage: 0,
          },
          {
            name: "Average Redemption",
            number: data.avgRedemptionRate ?? "0%", // FIXED
            percentage: 0,
          },
        ];

        setAnalyticsItems(items);
      } catch (err) {
        console.error("❌ Failed to fetch monthly analytics:", err);
        setAnalyticsItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [restaurantId]);

  const navigationTabs = ["Deal Performance", "Customer Insights"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 h-28 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          : analyticsItems.map((item, index) => (
              <Card
                key={index}
                name={item.name}
                number={item.number}
                percentage={item.percentage}
              />
            ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap bg-white border border-gray-200 rounded-md p-1 gap-2 sm:gap-4">
        {navigationTabs.map((tab) => (
          <span
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex-1 min-w-[120px] text-center text-sm font-medium py-2 px-3 cursor-pointer rounded transition-colors ${
              activeTab === tab
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Analyticscards;
