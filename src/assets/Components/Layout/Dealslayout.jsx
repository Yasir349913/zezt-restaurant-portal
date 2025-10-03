import React, { useState } from "react";
import Dealscards from "../Deals/Dealscards";
import DealsFilter from "../Deals/DealsFilter";
import DealsTable from "../Deals/DealsTable";
import Dealscalendar from "../Deals/Dealscalendar";
import CreateDealModal from "../Deals/Dealsform";
import { Plus } from "lucide-react";

export default function Dealslayout() {
  const [activeTab, setActiveTab] = useState("List View");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDealCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    console.log(
      "Deal created, refreshing data...",
      "New trigger:",
      refreshTrigger + 1
    );
  };

  const handleFilterApplied = (filteredData) => {
    console.log("Filtered data received:", filteredData);
    // You can handle the filtered data here if needed
    // For example, pass it to DealsTable to display filtered results
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "List View":
        return (
          <>
            <DealsFilter
              refreshTrigger={refreshTrigger}
              onFilterApplied={handleFilterApplied}
            />
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <DealsTable refreshTrigger={refreshTrigger} />
            </div>
          </>
        );
      case "Calendar View":
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Dealscalendar />
          </div>
        );
      default:
        return null;
    }
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
        <Dealscards
          onTabChange={handleTabChange}
          refreshTrigger={refreshTrigger}
        />

        {/* Tab Content */}
        {renderTabContent()}

        {/* Modal */}
        <CreateDealModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDealCreated={handleDealCreated}
        />
      </div>
    </div>
  );
}
