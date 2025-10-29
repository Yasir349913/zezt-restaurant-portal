// src/assets/Components/Layout/HotDealsLayout.jsx
import React, { useState } from "react";
import { Zap, Settings } from "lucide-react";
import HotKeysDashboard from "../HotDeals/HotKeysDashboard";
import TemplateManagement from "../HotDeals/TemplateManagement";

export default function HotDealsLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="xl:ml-64 pt-14 bg-gray-100 min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Hot Deals</h1>

          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === "dashboard"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Zap className="w-4 h-4" />
              Quick Launch
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === "management"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              Manage Templates
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "dashboard" ? (
          <HotKeysDashboard />
        ) : (
          <TemplateManagement />
        )}
      </div>
    </div>
  );
}