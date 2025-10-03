import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { getAllDealsForCurrentMonth } from "../../../api/services/Dealsservice";
import { useRestaurant } from "../../../context/RestaurantContext";

const DealsTable = ({ refreshTrigger }) => {
  const { restaurantId } = useRestaurant();
  const [currentPage, setCurrentPage] = useState(1);
  const [dealsData, setDealsData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDeals();
  }, [restaurantId, refreshTrigger]); // Add refreshTrigger as dependency

  const totalPages = 5;
  const totalDeals = dealsData.length;

  const toggleDropdown = (dealId) => {
    setActiveDropdown(activeDropdown === dealId ? null : dealId);
  };

  const handleAction = (action, dealId) => {
    console.log(`${action} deal ${dealId}`);
    setActiveDropdown(null);
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
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {["Edit", "Duplicate", "Delete"].map((action) => (
            <button
              key={action}
              onClick={() => handleAction(action, dealId)}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                action === "Delete"
                  ? "text-red-600 hover:bg-gray-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {action}
            </button>
          ))}
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

  const PaginationButton = ({
    page,
    isActive,
    onClick,
    disabled = false,
    children,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 text-sm border transition-colors rounded ${
        isActive
          ? "bg-blue-50 border-blue-200 text-blue-600"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{ fontSize: "13px" }}
    >
      {children || page}
    </button>
  );

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
            {dealsData.map((deal, index) => (
              <tr
                key={deal._id || deal.id || index}
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
                <td className="py-3 px-4">
                  <ActionDropdown
                    dealId={deal._id || deal.id}
                    isOpen={activeDropdown === (deal._id || deal.id)}
                    onToggle={toggleDropdown}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
        <div className="text-gray-600">{totalDeals} Deals shown</div>
        <div className="flex flex-wrap items-center gap-1">
          <PaginationButton
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </PaginationButton>
          {[1, 2, 3].map((page) => (
            <PaginationButton
              key={page}
              page={page}
              isActive={currentPage === page}
              onClick={() => goToPage(page)}
            />
          ))}
          {totalPages > 4 && <span className="px-2 text-gray-400">...</span>}
          <PaginationButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
};

export default DealsTable;
