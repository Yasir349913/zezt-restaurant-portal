// src/components/Analytics/Analyticscards.jsx
import React, { useEffect, useState } from "react";
import Card from "./Card";
import { getMonthlyStats } from "../../../api/services/Analyticsservice";
import { useRestaurant } from "../../../context/RestaurantContext";
import Loader from "../Common/Loader";

const Analyticscards = ({ onTabChange }) => {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState("Deal Performance");
  const [analyticsItems, setAnalyticsItems] = useState([
    { name: "Total Bookings", number: 0, percentage: 0 },
    { name: "Total Redemptions", number: 0, percentage: 0 },
    { name: "Total Revenue", number: "£ 0", percentage: 0 },
    { name: "Average Rating", number: "0.0", percentage: 0 },
    { name: "Average Redemption", number: "0%", percentage: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Check localStorage fallback
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("restaurantId")
          : null;
      const idToUse = restaurantId || fallbackId;

      try {
        if (!idToUse) {
          // No restaurant - set default 0 values
          setAnalyticsItems([
            { name: "Total Bookings", number: 0, percentage: 0 },
            { name: "Total Redemptions", number: 0, percentage: 0 },
            { name: "Total Revenue", number: "£ 0", percentage: 0 },
            { name: "Average Rating", number: "0.0", percentage: 0 },
            { name: "Average Redemption", number: "0%", percentage: 0 },
          ]);
          return;
        }

        const data = await getMonthlyStats(idToUse);
        console.log("📊 Backend Response:", data);

        const items = [
          {
            name: "Total Bookings",
            number: data.totalBookings ?? 0,
            percentage: 0,
          },
          {
            name: "Total Redemptions",
            number: data.totalRedemptions ?? 0,
            percentage: 0,
          },
          {
            name: "Total Revenue",
            number: `£ ${Number(data.totalRevenue ?? 0).toLocaleString()}`,
            percentage: 0,
          },
          {
            name: "Average Rating",
            number: Number(data.averageRating ?? 0).toFixed(1),
            percentage: 0,
          },
          {
            name: "Average Redemption",
            number: data.avgRedemptionRate ?? "0%",
            percentage: 0,
          },
        ];

        setAnalyticsItems(items);
      } catch (err) {
        console.error("❌ Failed to fetch monthly analytics:", err);
        // On error, show 0 values (graceful fallback)
        setAnalyticsItems([
          { name: "Total Bookings", number: 0, percentage: 0 },
          { name: "Total Redemptions", number: 0, percentage: 0 },
          { name: "Total Revenue", number: "£ 0", percentage: 0 },
          { name: "Average Rating", number: "0.0", percentage: 0 },
          { name: "Average Redemption", number: "0%", percentage: 0 },
        ]);
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
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader size="md" text="Loading analytics..." />
          </div>
        ) : (
          analyticsItems.map((item, index) => (
            <Card
              key={index}
              name={item.name}
              number={item.number}
              percentage={item.percentage}
            />
          ))
        )}
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
