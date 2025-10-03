// src/components/Analytics/Analyticscards.jsx
import React, { useEffect, useState } from "react";
import Card from "./Card"; // your existing small card component
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
        // create card items in the same shape your Card expects:
        const items = [
          {
            name: "Active Deals",
            number: data.activeDealsCount ?? 0,
            percentage: 0,
          },
          {
            name: "Total Redemptions",
            number: data.totalRedemptions ?? 0,
            percentage: 0,
          },
          {
            name: "Total Revenue",
            number: data.totalRevenue ?? 0,
            percentage: 0,
          },
          {
            name: "Avg Redemption Rate",
            number: data.avgRedemptionRate ?? "0.00%",
            percentage: 0,
          },
        ];
        setAnalyticsItems(items);
      } catch (err) {
        console.error("Failed to fetch monthly analytics:", err);
        setAnalyticsItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [restaurantId]);

  const navigationTabs = [
    "Deal Performance",
    "Aura Insights",
    "Customer Insights",
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? // simple placeholders while loading
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 h-28 animate-pulse"
              />
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
