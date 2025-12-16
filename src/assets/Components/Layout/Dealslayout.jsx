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

  // ✅ Admin approval state with additional fields
  const [adminStatus, setAdminStatus] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [hasTrialEnded, setHasTrialEnded] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ✅ State for restaurant not found error
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);

  // ✅ NEW: State for Stripe not connected error
  const [stripeNotConnected, setStripeNotConnected] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Fetch admin status on component mount
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        setLoadingStatus(true);
        const response = await checkAdminStatus();
        console.log("Admin status response:", response);

        // ✅ Priority 1: Check if restaurant not found
        if (response.error === "Restaurant not found") {
          setRestaurantNotFound(true);
          setStripeNotConnected(false);
          setErrorMessage(
            response.message || "Please create a restaurant account first."
          );
          setIsApproved(false);
          setStatusMessage(response.message || "");
          return;
        }

        // ✅ Priority 2: Check if Stripe not connected
        if (response.error === "Stripe not connected") {
          setStripeNotConnected(true);
          setRestaurantNotFound(false);
          setErrorMessage(
            response.message || "Please connect your Stripe account first."
          );
          setIsApproved(false);
          setStatusMessage(response.message || "");
          return;
        }

        // ✅ Reset error states if no errors
        setRestaurantNotFound(false);
        setStripeNotConnected(false);
        setErrorMessage("");

        setAdminStatus(response.admin_status);
        setIsApproved(response.is_approved || false);
        setHasTrialEnded(response.has_trial_ended || false);
        setIsSubscriptionActive(response.is_Subscription_Active !== false);
        setStatusMessage(response.message || "");
      } catch (error) {
        console.error("Failed to fetch admin status:", error);

        // ✅ Check error response for specific errors
        const errorData = error?.response?.data;

        if (errorData?.error === "Restaurant not found") {
          setRestaurantNotFound(true);
          setStripeNotConnected(false);
          setErrorMessage(
            errorData.message || "Please create a restaurant account first."
          );
          setIsApproved(false);
        } else if (errorData?.error === "Stripe not connected") {
          setStripeNotConnected(true);
          setRestaurantNotFound(false);
          setErrorMessage(
            errorData.message || "Please connect your Stripe account first."
          );
          setIsApproved(false);
        } else {
          // On other errors, assume not approved for safety
          setIsApproved(false);
          setHasTrialEnded(false);
          setIsSubscriptionActive(true);
          setStatusMessage("");
        }
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
    // ✅ Priority 1: Restaurant not found
    if (restaurantNotFound) {
      return {
        title: "Restaurant Not Found",
        message: errorMessage,
        canCreateDeal: false,
        showBanner: true,
        bannerType: "error", // red banner
      };
    }

    // ✅ Priority 2: Stripe not connected
    if (stripeNotConnected) {
      return {
        title: "Stripe Account Not Connected",
        message: errorMessage,
        canCreateDeal: false,
        showBanner: true,
        bannerType: "error", // red banner
      };
    }

    if (!loadingStatus && statusMessage) {
      // Scenario 3: Restaurant not approved (pending)
      if (!isApproved && adminStatus === "pending") {
        return {
          title: "Restaurant Approval Pending",
          message: statusMessage,
          canCreateDeal: false,
          showBanner: true,
          bannerType: "warning", // yellow banner
        };
      }

      // Scenario 4: Trial period ended
      if (hasTrialEnded) {
        return {
          title: "Trial Period Expired",
          message: statusMessage,
          canCreateDeal: false,
          showBanner: true,
          bannerType: "warning", // yellow banner
        };
      }

      // Scenario 5: Subscription inactive
      if (!isSubscriptionActive) {
        return {
          title: "Subscription Inactive",
          message: statusMessage,
          canCreateDeal: false,
          showBanner: true,
          bannerType: "warning", // yellow banner
        };
      }
    }

    // Default: Everything is fine
    return {
      title: null,
      message: "",
      canCreateDeal: true,
      showBanner: false,
      bannerType: null,
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

            {/* ✅ Show message on hover if not able to create deal */}
            {!loadingStatus &&
              !statusInfo.canCreateDeal &&
              statusInfo.message && (
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
                        {statusInfo.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ✅ Banner with appropriate styling based on error type */}
        {!loadingStatus && statusInfo.showBanner && statusInfo.message && (
          <div
            className={`border-l-4 p-4 rounded-r-lg ${
              statusInfo.bannerType === "error"
                ? "bg-red-50 border-red-400"
                : "bg-yellow-50 border-yellow-400"
            }`}
          >
            <div className="flex items-start">
              <AlertCircle
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  statusInfo.bannerType === "error"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              />
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    statusInfo.bannerType === "error"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {statusInfo.title}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    statusInfo.bannerType === "error"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}
                >
                  {statusInfo.message}
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
