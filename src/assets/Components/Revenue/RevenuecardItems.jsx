// src/assets/Components/Revenue/RevenuecardItems.jsx
import React, { useState, useEffect } from "react";
import Carditem from "./CardItem";
import {
  getRevenueOverview,
  getBillingInfo,
} from "../../../api/services/Revenueservices";
import { useRestaurant } from "../../../context/RestaurantContext";

const RevenuecardItems = ({ onTabChange }) => {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState("Revenue Overview");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigationTabs = ["Revenue Overview", "Billing & invoices"];

  // Format currency helper
  const formatCurrency = (value) => {
    if (typeof value !== "number") return "-";
    return `Rs ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let cardItems = [];

        if (activeTab === "Revenue Overview") {
          const data = await getRevenueOverview(restaurantId);
          const d = data?.data;

          console.log("📊 Revenue Overview Data:", d);

          if (d) {
            cardItems = [
              // Card 1: Total Revenue
              {
                name: "Total Revenue",
                number: formatCurrency(d.totalRevenue),
                percentage: d.percentageChange ?? 0,
                subtitle: `${d.totalBookings || 0} bookings`,
              },
              // Card 2: Previous Month Revenue (NEW)
              {
                name: "Previous Month Revenue",
                number: formatCurrency(d.previousMonthRevenue),
                percentage: 0,
                subtitle: "Last month total",
              },
              // Card 3: Percentage Change (NEW - Standalone Card)
              {
                name: "Growth Rate",
                number: `${d.percentageChange > 0 ? "+" : ""}${
                  d.percentageChange?.toFixed(1) ?? 0
                }%`,
                percentage: d.percentageChange ?? 0,
                subtitle:
                  d.percentageChange >= 0
                    ? "📈 Revenue is growing"
                    : "📉 Revenue decreased",
              },
              // Card 4: Net Revenue
              {
                name: "Net Revenue",
                number: formatCurrency(d.netRevenue),
                percentage: d.percentageChange ?? 0,
                subtitle: "After subscription fee",
              },
              // Card 5: Subscription Fee
              {
                name: "Subscription Fee",
                number: formatCurrency(d.subscriptionFee),
                percentage: 0,
                subtitle: d.subscriptionStatus || "Status",
              },
              // Card 6: Total Bookings (NEW)
              {
                name: "Total Bookings",
                number: d.totalBookings || 0,
                percentage: 0,
                subtitle: "This month",
              },
            ];
          }
        } else if (activeTab === "Billing & invoices") {
          const data = await getBillingInfo(restaurantId);
          const d = data?.data;

          console.log("💳 Billing Info Data:", d);

          if (d) {
            const current = d.currentMonth || {};
            cardItems = [
              {
                name: "Payment Status",
                number: d.paymentStatus || "-",
                percentage: 0,
                subtitle: "Current status",
              },
              {
                name: "This Month Subscription",
                number: formatCurrency(current.paidSubscription),
                percentage: 0,
                subtitle: "Monthly fee",
              },
              {
                name: "Outstanding Amount",
                number: formatCurrency(d.outstandingAmount),
                percentage: 0,
                subtitle: "Due amount",
              },
              {
                name: "Next Payment Due",
                number: formatDate(d.nextPaymentDue),
                percentage: 0,
                subtitle: "Payment date",
              },
            ];
          }
        }

        setItems(cardItems);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError(error.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, restaurantId]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  if (!restaurantId) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please select a restaurant to view revenue data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Cards Grid - Now 6 cards for Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm animate-pulse p-4 border border-gray-200 min-h-[117px]"
            >
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <Carditem
              key={index}
              name={item.name || "—"}
              number={item.number ?? "0"}
              percentage={item.percentage ?? 0}
              subtitle={item.subtitle}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No data available for {activeTab}
          </div>
        )}
      </div>

      {/* Tabs */}
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

export default RevenuecardItems;
