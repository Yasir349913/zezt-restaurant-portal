// src/assets/Components/Layout/Revenuelayout.jsx
import React, { useState } from "react";
import RevenuecardItems from "../Revenue/RevenuecardItems";
import RevenueOverviewgraphs from "../Revenue/RevenueOverview";
import RecentInvoices from "../Revenue/RecentInvoices";
import Progressbar from "../Revenue/Progressbar";

export default function Revenuelayout() {
  const [activeTab, setActiveTab] = useState("Revenue Overview");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800">Revenue Dashboard</h1>

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
