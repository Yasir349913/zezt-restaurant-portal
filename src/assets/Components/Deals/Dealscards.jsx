import React, { useState, useEffect } from "react";
import Dealscardlists from "./Dealscardlists";
import { getDealDashboardData } from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const Dealscards = ({ onTabChange, refreshTrigger }) => {
  const { restaurantId } = useRestaurant();
  const [dealsData, setDealsData] = useState([]);
  const [activeTab, setActiveTab] = useState("List View");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    if (!restaurantId) {
      console.log("No restaurant ID available");
      return;
    }

    console.log("Fetching dashboard data for restaurant:", restaurantId);
    setLoading(true);

    getDealDashboardData(restaurantId)
      .then((data) => {
        console.log("Dashboard data received:", data);

        // Match backend response: activeDealsCount, totalRedemptions, totalRevenue, avgRedemptionRate
        const cardsArray = [
          {
            name: "Active Deals",
            number: data.activeDealsCount || 0,
            percentage: 0,
          },
          {
            name: "Total Redemptions",
            number: data.totalRedemptions || 0,
            percentage: 0,
          },
          {
            name: "Total Revenue",
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
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard deals:", err);
        console.error("Error details:", err.response?.data);

        // Set default values on error
        setDealsData([
          { name: "Active Deals", number: 0, percentage: 0 },
          { name: "Total Redemptions", number: 0, percentage: 0 },
          { name: "Total Revenue", number: 0, percentage: 0 },
          { name: "Avg Redemption Rate", number: "0%", percentage: 0 },
        ]);
      })
      .finally(() => setLoading(false));
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

  const navigationTabs = ["List View", "Calendar View"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Deals Cards */}
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

      {/* Navigation Tabs */}
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-wrap sm:flex-nowrap bg-white border border-gray-300 rounded-md p-1 gap-2">
          {navigationTabs.map((tab) => (
            <span
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 text-center text-sm font-medium rounded cursor-pointer px-3 py-2 transition-colors ${
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
    </div>
  );
};

export default Dealscards;
