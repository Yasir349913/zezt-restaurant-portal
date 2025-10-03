// src/components/Layout/Analyticslayout.jsx
import React, { useState } from "react";
import Analyticscards from "../Analytics/Analyticscards";
import Analyticsgraph from "../Analytics/Analyticsgraph";
import Customergraphs from "../Analytics/Customergraphs";

export default function Analyticslayout() {
  const [activeTab, setActiveTab] = useState("Deal Performance");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Deal Performance":
        return (
          <>
            {/* Analytics Graph */}
            <Analyticsgraph />
          </>
        );

      case "Customer Insights":
        return (
          <>
            {/* Customer Graphs */}
            <Customergraphs />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>

        {/* Analytics Cards with Navigation */}
        <Analyticscards onTabChange={handleTabChange} />

        {/* Dynamic Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
