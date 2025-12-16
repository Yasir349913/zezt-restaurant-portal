// src/assets/Components/Layout/HotDealsLayout.jsx
import React, { useState } from "react";
import { Zap, Settings } from "lucide-react";
import HotKeysDashboard from "../HotDeals/HotKeysDashboard";
import TemplateManagement from "../HotDeals/TemplateManagement";
import { useRestaurant } from "../../../context/RestaurantContext";

export default function HotDealsLayout() {
  const { restaurantId } = useRestaurant();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if restaurant exists (from context or localStorage)
  const fallbackId =
    typeof window !== "undefined" ? localStorage.getItem("restaurantId") : null;
  const hasRestaurant = restaurantId || fallbackId;

  return (
    <div className="xl:ml-64 pt-14 bg-gray-100 min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Hot Deals</h1>

          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              disabled={!hasRestaurant}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                activeTab === "dashboard"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } ${
                !hasRestaurant
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              title={!hasRestaurant ? "Please create a restaurant first" : ""}
            >
              <Zap className="w-4 h-4" />
              Quick Launch
            </button>
            <button
              onClick={() => setActiveTab("management")}
              disabled={!hasRestaurant}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                activeTab === "management"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } ${
                !hasRestaurant
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              title={!hasRestaurant ? "Please create a restaurant first" : ""}
            >
              <Settings className="w-4 h-4" />
              Manage Templates
            </button>
          </div>
        </div>

        {/* ✅ Warning banner if no restaurant */}
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
                  Please create a restaurant to access Hot Deals features. Go to
                  settings in the SideBar on the Left to create a Restaurant
                  Account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content - Always render, components handle their own empty states */}
        {activeTab === "dashboard" ? (
          <HotKeysDashboard />
        ) : (
          <TemplateManagement />
        )}
      </div>
    </div>
  );
}
