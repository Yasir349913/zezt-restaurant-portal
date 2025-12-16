// src/assets/Components/Layout/Revenuelayout.jsx
import React, { useState } from "react";
import RevenuecardItems from "../Revenue/RevenuecardItems";
import RevenueOverviewgraphs from "../Revenue/RevenueOverview";
import RecentInvoices from "../Revenue/RecentInvoices";
import Progressbar from "../Revenue/Progressbar";
import { useRestaurant } from "../../../context/RestaurantContext";

export default function Revenuelayout() {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState("Revenue Overview");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Check if restaurant exists (from context or localStorage)
  const fallbackId =
    typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;
  const hasRestaurant = restaurantId || fallbackId;

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800">Revenue Dashboard</h1>

        {/* ✅ Warning banner if no restaurant (instead of blocking error) */}
        {!hasRestaurant && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  No restaurant created yet
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Please create a restaurant to see live revenue data. Go to
                  settings in the SideBar on the Left to create a Restaurant
                  Account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Cards with Tabs */}
        <RevenuecardItems onTabChange={handleTabChange} />

        {/* Conditional Content Based on Active Tab */}
        {activeTab === "Revenue Overview" ? (
          // ✅ Revenue Overview Content
          <>
            <RevenueOverviewgraphs />
          </>
        ) : (
          // ✅ Billing & Invoices Content
          <>
            {/* Recent Invoices - Full Width */}
            <RecentInvoices />

            {/* Billing Info & Usage Progress */}
            <Progressbar />
          </>
        )}
      </div>
    </div>
  );
}
