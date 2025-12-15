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

  // ✅ Admin approval state with additional fields for trial and subscription
  const [adminStatus, setAdminStatus] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [hasTrialEnded, setHasTrialEnded] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ✅ Fetch admin status on component mount
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        setLoadingStatus(true);
        const response = await checkAdminStatus();
        console.log("Admin status response:", response);

        setAdminStatus(response.admin_status);
        setIsApproved(response.is_approved || false);
        setHasTrialEnded(response.has_trial_ended || false);
        setIsSubscriptionActive(response.is_Subscription_Active !== false);
        setStatusMessage(response.message || "");
      } catch (error) {
        console.error("Failed to fetch admin status:", error);
        // On error, assume not approved for safety
        setIsApproved(false);
        setHasTrialEnded(false);
        setIsSubscriptionActive(true);
        setStatusMessage("");
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

  // ✅ Determine which scenario to display
  const getStatusInfo = () => {
    if (!loadingStatus && statusMessage) {
      // Scenario 1: Restaurant not approved (pending)
      if (!isApproved && adminStatus === "pending") {
        return {
          title: "Restaurant Approval Pending",
          canCreateDeal: false,
        };
      }

      // Scenario 2: Trial period ended
      if (hasTrialEnded) {
        return {
          title: "Trial Period Expired",
          canCreateDeal: false,
        };
      }

      // Scenario 3: Subscription inactive
      if (!isSubscriptionActive) {
        return {
          title: "Subscription Inactive",
          canCreateDeal: false,
        };
      }
    }

    // Default: Everything is fine
    return {
      title: null,
      canCreateDeal: true,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      <div className="p-6 space-y-6 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Deals Management</h1>

          {/* ✅ Create Deal Button with approval check */}
          <div className="relative group">
            <button
              onClick={() => statusInfo.canCreateDeal && setIsModalOpen(true)}
              disabled={!statusInfo.canCreateDeal || loadingStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm ${
                statusInfo.canCreateDeal && !loadingStatus
                  ? "bg-[#E57272] hover:bg-[#E57272]/90 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus size={18} />
              {loadingStatus ? "Loading..." : "Create New Deal"}
            </button>

            {/* ✅ Show backend message on hover if not able to create deal */}
            {!loadingStatus && !statusInfo.canCreateDeal && statusMessage && (
              <div className="invisible group-hover:visible absolute top-full right-0 mt-2 w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-10 transition-all duration-200">
                <div className="flex gap-2">
                  <AlertCircle
                    size={20}
                    className="text-yellow-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      {statusInfo.title}
                    </p>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      {statusMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Banner with appropriate message for each scenario */}
        {!loadingStatus && !statusInfo.canCreateDeal && statusMessage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0 mt-0.5"
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {statusInfo.title}
                </h3>
                <p className="text-sm text-yellow-700 mt-1">{statusMessage}</p>
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
