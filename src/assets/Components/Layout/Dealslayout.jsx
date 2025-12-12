// src/components/Dealslayout.jsx
import React, { useState, useEffect } from "react";
import Dealscards from "../Deals/Dealscards";
import DealsFilter from "../Deals/DealsFilter";
import DealsTable from "../Deals/DealsTable";
import CreateDealModal from "../Deals/Dealsform";
import { Plus, AlertCircle } from "lucide-react";
import { checkAdminStatus } from "../../../api/services/Dealsservice";

export default function Dealslayout() {
  const [activeTab, setActiveTab] = useState("List View");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filteredDeals, setFilteredDeals] = useState(null);

  // ✅ Admin approval state
  const [adminStatus, setAdminStatus] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ✅ Fetch admin status on component mount
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        setLoadingStatus(true);
        const response = await checkAdminStatus();
        console.log("Admin status response:", response);

        // ✅ FIXED: Use is_approved boolean from backend
        setAdminStatus(response.admin_status);
        setIsApproved(response.is_approved); // Using the boolean field directly
        setApprovalMessage(response.message || "");
      } catch (error) {
        console.error("Failed to fetch admin status:", error);
        // On error, assume not approved for safety
        setIsApproved(false);
        setApprovalMessage("");
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchAdminStatus();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDealCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setFilteredDeals(null);
  };

  const handleFilterApplied = (filteredData) => {
    console.log("Filtered data received:", filteredData);
    setFilteredDeals(Array.isArray(filteredData) ? filteredData : []);
  };

  const renderTabContent = () => {
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

          {/* ✅ Create Deal Button with approval check */}
          <div className="relative group">
            <button
              onClick={() => isApproved && setIsModalOpen(true)}
              disabled={!isApproved || loadingStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm ${
                isApproved && !loadingStatus
                  ? "bg-[#E57272] hover:bg-[#E57272]/90 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={18} />
              {loadingStatus ? "Loading..." : "Create New Deal"}
            </button>

            {/* ✅ Show backend message on hover if not approved */}
            {!loadingStatus && !isApproved && approvalMessage && (
              <div className="invisible group-hover:visible absolute top-full right-0 mt-2 w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-10 transition-all duration-200">
                <div className="flex gap-2">
                  <AlertCircle
                    size={20}
                    className="text-yellow-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Approval Required
                    </p>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      {approvalMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Banner with backend message if not approved */}
        {!loadingStatus && !isApproved && approvalMessage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0 mt-0.5"
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Restaurant Approval Pending
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {approvalMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deals Cards */}
        <Dealscards refreshTrigger={refreshTrigger} />

        {/* Tab Content */}
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
