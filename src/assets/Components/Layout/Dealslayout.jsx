import React, { useState } from "react";
import Dealscards from "../Deals/Dealscards";
import DealsFilter from "../Deals/DealsFilter";
import DealsTable from "../Deals/DealsTable";
import Dealscalendar from "../Deals/Dealscalendar";
import CreateDealModal from "../Deals/Dealsform"; // your existing create modal
import { Plus } from "lucide-react";

export default function Dealslayout() {
  const [activeTab, setActiveTab] = useState("List View"); // Default is List View
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // NEW: filtered deals state (null = no filter applied)
  const [filteredDeals, setFilteredDeals] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDealCreated = () => {
    // increment refresh trigger and clear filters to force refetch
    setRefreshTrigger((prev) => prev + 1);
    setFilteredDeals(null);
  };

  const handleFilterApplied = (filteredData) => {
    // filteredData is expected to be an array (can be empty)
    console.log("Filtered data received:", filteredData);
    setFilteredDeals(Array.isArray(filteredData) ? filteredData : []);
  };

  const renderTabContent = () => {
    // Since we're removing tabs, always show List View content
    return (
      <>
        <DealsFilter
          refreshTrigger={refreshTrigger}
          onFilterApplied={handleFilterApplied}
        />
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <DealsTable
            refreshTrigger={refreshTrigger}
            filteredDeals={filteredDeals}
          />
        </div>
      </>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Deals Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#E57272] hover:bg-[#E57272]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            <Plus size={18} />
            Create New Deal
          </button>
        </div>

        {/* Deals Cards */}
        <Dealscards refreshTrigger={refreshTrigger} />

        {/* Tab Content - Always shows List View */}
        {renderTabContent()}

        {/* Create Modal */}
        <CreateDealModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDealCreated={handleDealCreated}
        />
      </div>
    </div>
  );
}
