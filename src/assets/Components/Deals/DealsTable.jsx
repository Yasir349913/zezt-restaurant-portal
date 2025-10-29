import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  getAllDealsForCurrentMonth,
  deleteDeal,
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

  // modal / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

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

  // Use filteredDeals from parent when provided (null => no filter)
  useEffect(() => {
    if (filteredDeals === null) return;
    setDealsData(filteredDeals);
    setLoading(false);
  }, [filteredDeals]);

  // Fetch only when there is no external filtered data
  useEffect(() => {
    if (filteredDeals !== null) return;
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, refreshTrigger, filteredDeals]);

  const totalPages = 5;
  const totalDeals = dealsData.length;

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
      }"? This action cannot be undone.`
    );
    if (!confirmed) {
      setActiveDropdown(null);
      return;
    }

    setActionLoadingId(dealId);
    try {
      await deleteDeal(dealId);
      setDealsData((prev) => prev.filter((d) => (d._id || d.id) !== dealId));
      alert("Deal deleted successfully.");
    } catch (err) {
      console.error("Failed to delete deal:", err);
      alert("Failed to delete deal. See console for details.");
    } finally {
      setActionLoadingId(null);
      setActiveDropdown(null);
    }
  };

  // After modal saves (create/update), update row in-place or refetch
  const handleModalSaved = ({ mode, deal }) => {
    if (!deal) {
      // fallback: refetch when no deal object returned
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
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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

  const ActionDropdown = ({ dealId, isOpen, onToggle }) => (
    <div className="relative">
      <button
        onClick={() => onToggle(dealId)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        disabled={actionLoadingId === dealId}
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <button
            onClick={() => openEditModal(dealId)}
            className="w-full px-3 py-2 text-left text-sm transition-colors text-gray-700 hover:bg-gray-50"
          >
            Update
          </button>

          <button
            onClick={() => handleDelete(dealId)}
            className="w-full px-3 py-2 text-left text-sm transition-colors text-red-600 hover:bg-gray-50"
            disabled={actionLoadingId === dealId}
          >
            {actionLoadingId === dealId ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase() || "inactive";
    const isActive = normalizedStatus === "active";

    return (
      <span
        className="px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap"
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
                {[
                  "Deal",
                  "Start Date",
                  "End Date",
                  "Redemptions",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left py-3 px-4 font-medium text-gray-700 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dealsData.map((deal, index) => {
                const id = deal._id || deal.id || index;
                return (
                  <tr
                    key={id}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-4 text-gray-800">
                      {deal.deal_title || "Untitled Deal"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(deal.deal_start_date)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(deal.deal_expires_at)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {deal.redemption || 0}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={deal.deal_status} />
                    </td>
                    <td className="py-3 px-4 relative overflow-visible">
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

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
          <div className="text-gray-600">{totalDeals} Deals shown</div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border transition-colors rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm border transition-colors rounded ${
                  currentPage === page
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                style={{ fontSize: "13px" }}
              >
                {page}
              </button>
            ))}

            {totalPages > 4 && <span className="px-2 text-gray-400">...</span>}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border transition-colors rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
