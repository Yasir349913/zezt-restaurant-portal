import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  getAllDealsForCurrentMonth,
  deleteDeal,
  checkAdminStatus,
} from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";
import DealModal from "./DealModel";

const DealsTable = ({ refreshTrigger, filteredDeals = null }) => {
  const { restaurantId } = useRestaurant();
  const [currentPage, setCurrentPage] = useState(1);
  const [dealsData, setDealsData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  // ✅ Admin status state
  const [canPerformActions, setCanPerformActions] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ✅ Pagination settings
  const DEALS_PER_PAGE = 10;

  const fetchDeals = () => {
    if (!restaurantId) return;

    setLoading(true);
    getAllDealsForCurrentMonth(restaurantId)
      .then((data) => {
        const dealsArray = Array.isArray(data) ? data : data?.deals || [];
        setDealsData(dealsArray);
      })
      .catch((err) =>
        console.error("Failed to fetch deals for current month:", err)
      )
      .finally(() => setLoading(false));
  };

  // ✅ Fetch admin status on mount
  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        setLoadingStatus(true);
        const response = await checkAdminStatus();
        console.log("Admin status response:", response);

        // Check if actions are allowed
        const isApproved = response.is_approved !== false;
        const hasTrialEnded = response.has_trial_ended === true;
        const isSubscriptionActive = response.is_Subscription_Active !== false;

        // Actions are allowed only if approved AND trial hasn't ended AND subscription is active
        const actionsAllowed =
          isApproved && !hasTrialEnded && isSubscriptionActive;

        setCanPerformActions(actionsAllowed);
        setStatusMessage(response.message || "");
      } catch (error) {
        console.error("Failed to fetch admin status:", error);
        // On error, allow actions (fail open)
        setCanPerformActions(true);
        setStatusMessage("");
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchAdminStatus();
  }, []);

  useEffect(() => {
    if (filteredDeals === null) return;
    setDealsData(filteredDeals);
    setLoading(false);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredDeals]);

  useEffect(() => {
    if (filteredDeals !== null) return;
    fetchDeals();
  }, [restaurantId, refreshTrigger, filteredDeals]);

  // ✅ Calculate pagination values dynamically
  const totalDeals = dealsData.length;
  const totalPages = Math.ceil(totalDeals / DEALS_PER_PAGE);
  const startIndex = (currentPage - 1) * DEALS_PER_PAGE;
  const endIndex = startIndex + DEALS_PER_PAGE;
  const currentDeals = dealsData.slice(startIndex, endIndex);

  const toggleDropdown = (dealId) => {
    setActiveDropdown(activeDropdown === dealId ? null : dealId);
  };

  const openEditModal = (dealId) => {
    const deal = dealsData.find((d) => (d._id || d.id) === dealId);
    if (!deal) return alert("Deal not found");
    setEditingDeal(deal);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (dealId) => {
    const deal = dealsData.find((d) => (d._id || d.id) === dealId);
    if (!deal) return alert("Deal not found");

    const confirmed = window.confirm(
      `Are you sure you want to delete the deal "${
        deal.deal_title || "Untitled"
      }"?`
    );
    if (!confirmed) {
      setActiveDropdown(null);
      return;
    }

    setActionLoadingId(dealId);
    try {
      await deleteDeal(dealId);
      setDealsData((prev) => {
        const updatedDeals = prev.filter((d) => (d._id || d.id) !== dealId);

        // ✅ Adjust current page if needed after deletion
        const newTotalPages = Math.ceil(updatedDeals.length / DEALS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }

        return updatedDeals;
      });
      alert("Deal deleted successfully.");
    } catch (err) {
      console.error("Failed to delete deal:", err);
      alert("Failed to delete deal.");
    } finally {
      setActionLoadingId(null);
      setActiveDropdown(null);
    }
  };

  const handleModalSaved = ({ mode, deal }) => {
    if (!deal) {
      fetchDeals();
      return;
    }

    const id = deal._id || deal.id;
    if (mode === "update") {
      setDealsData((prev) =>
        prev.map((d) => ((d._id || d.id) === id ? deal : d))
      );
    } else if (mode === "create") {
      setDealsData((prev) => [deal, ...prev]);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ Generate page numbers array dynamically
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const ActionDropdown = ({ dealId, isOpen, onToggle }) => (
    <div className="relative">
      <button
        onClick={() => onToggle(dealId)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {/* Update Button */}
          <div className="relative group">
            <button
              onClick={() => canPerformActions && openEditModal(dealId)}
              disabled={!canPerformActions}
              className={`w-full px-3 py-2 text-left text-sm ${
                canPerformActions
                  ? "text-gray-700 hover:bg-gray-50 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed bg-gray-50"
              }`}
            >
              Update
            </button>

            {/* Tooltip on hover for disabled state */}
            {!canPerformActions && statusMessage && (
              <div className="invisible group-hover:visible absolute left-full top-0 ml-2 w-64 bg-yellow-50 border border-yellow-200 rounded-md p-3 shadow-lg z-50">
                <p className="text-xs text-yellow-800">{statusMessage}</p>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <div className="relative group">
            <button
              onClick={() => canPerformActions && handleDelete(dealId)}
              disabled={!canPerformActions}
              className={`w-full px-3 py-2 text-left text-sm ${
                canPerformActions
                  ? "text-red-600 hover:bg-gray-50 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed bg-gray-50"
              }`}
            >
              Delete
            </button>

            {/* Tooltip on hover for disabled state */}
            {!canPerformActions && statusMessage && (
              <div className="invisible group-hover:visible absolute left-full top-0 ml-2 w-64 bg-yellow-50 border border-yellow-200 rounded-md p-3 shadow-lg z-50">
                <p className="text-xs text-yellow-800">{statusMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase() || "inactive";
    const isActive = normalizedStatus === "active";

    return (
      <span
        className="px-2 py-1 text-xs rounded-full font-medium"
        style={{
          backgroundColor: isActive ? "#E0F2FE" : "#F3F4F6",
          color: isActive ? "#0369A1" : "#6B7280",
        }}
      >
        {status || "Inactive"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
        Loading deals...
      </div>
    );
  }

  if (dealsData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
        No deals available for this month.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Deal", "Start Date", "End Date", "Status", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {currentDeals.map((deal, index) => {
                const id = deal._id || deal.id || index;
                const globalIndex = startIndex + index;

                return (
                  <tr
                    key={id}
                    className={`border-b border-gray-100 ${
                      globalIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-800">
                      <div>{deal.deal_title || "Untitled Deal"}</div>

                      {/* ✅ PRICE with £ symbol */}
                      {deal.deal_price && (
                        <div className="text-gray-500 text-xs mt-1">
                          £{deal.deal_price}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(deal.deal_start_date)}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(deal.deal_expires_at)}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={deal.deal_status} />
                    </td>

                    <td className="py-3 px-4 relative">
                      <ActionDropdown
                        dealId={id}
                        isOpen={activeDropdown === id}
                        onToggle={toggleDropdown}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ Show footer info and pagination only if there are deals */}
        <div className="flex items-center justify-between px-4 py-3 text-sm border-t border-gray-200">
          <div className="text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalDeals)} of{" "}
            {totalDeals} deals
          </div>

          {/* ✅ Only show pagination if there are more than 10 deals */}
          {totalDeals > DEALS_PER_PAGE && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* ✅ Dynamic page numbers based on actual total pages */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 border rounded transition-colors ${
                    currentPage === page
                      ? "bg-blue-50 border-blue-200 text-blue-600 font-medium"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <DealModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDeal(null);
        }}
        initialData={editingDeal}
        onSaved={(payload) => {
          handleModalSaved(payload || {});
          setIsModalOpen(false);
          setEditingDeal(null);
        }}
      />
    </>
  );
};

export default DealsTable;
