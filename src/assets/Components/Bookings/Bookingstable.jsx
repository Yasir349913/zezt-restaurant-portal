// src/components/Bookings/BookingTable.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  cancelBooking,
  markBookingNoShow,
  markBookingCompleted,
} from "../../../api/services/Bookingsservice";

const BookingTable = ({ bookings, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loadingIds, setLoadingIds] = useState(new Set());

  const itemsPerPage = 10;
  const totalPages = Math.ceil((bookings?.length || 0) / itemsPerPage);

  const paginatedBookings =
    bookings?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ) || [];

  const toggleDropdown = (id) =>
    setActiveDropdown(activeDropdown === id ? null : id);

  const setLoadingFor = (id, value) =>
    setLoadingIds((prev) => {
      const copy = new Set(prev);
      if (value) copy.add(id);
      else copy.delete(id);
      return copy;
    });

  const ALLOWED_ACTIONS = ["cancel", "noshow", "complete"];

  const handleAction = async (action, booking) => {
    const bookingId = booking._id;

    if (loadingIds.has(bookingId)) return;

    try {
      setLoadingFor(bookingId, true);
      setActiveDropdown(null);

      switch (action) {
        case "cancel": {
          const reason = prompt("Enter cancellation reason (optional):");
          if (reason === null) return;

          const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
          );
          if (!confirmed) return;

          await cancelBooking(bookingId, reason || "");
          alert("Booking cancelled successfully!");
          break;
        }

        case "noshow": {
          const confirmed = window.confirm(
            "Mark this booking as no-show? Customer will NOT be refunded."
          );
          if (!confirmed) return;

          await markBookingNoShow(bookingId);
          alert("Booking marked as no-show!");
          break;
        }

        case "complete": {
          const confirmed = window.confirm("Mark this booking as completed?");
          if (!confirmed) return;

          await markBookingCompleted(bookingId);
          alert("Booking marked as completed!");
          break;
        }

        default:
          console.warn("Unsupported action", action);
      }

      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Action error:", err);
      const friendly = err.message || "Failed to perform action";
      alert(friendly);
    } finally {
      setLoadingFor(bookingId, false);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      noshow: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const PaginationButton = ({
    page,
    isActive,
    onClick,
    disabled,
    children,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm border transition-colors rounded-md ${
        isActive
          ? "bg-blue-50 border-blue-200 text-blue-600"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children || page}
    </button>
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Get available actions based on booking status - IGNORE BACKEND availableActions
  const getAvailableActions = (booking) => {
    const status = (booking.status || "").toLowerCase();
    const actions = [];

    // ALWAYS use status-based logic, ignore backend availableActions
    switch (status) {
      case "pending":
      case "confirmed":
        // Show all three actions for pending/confirmed bookings
        actions.push(
          { action: "cancel", label: "Cancel" },
          { action: "noshow", label: "No-Show" },
          { action: "complete", label: "Complete" }
        );
        break;

      case "cancelled":
      case "completed":
      case "noshow":
        // No actions for already finalized bookings
        break;

      default:
        // For any other status, show cancel as fallback
        actions.push({ action: "cancel", label: "Cancel" });
    }

    return actions;
  };

  // Get action button style based on action type
  const getActionStyle = (action) => {
    switch (action) {
      case "cancel":
        return "text-red-600 hover:bg-red-50";
      case "noshow":
        return "text-orange-600 hover:bg-orange-50";
      case "complete":
        return "text-green-600 hover:bg-green-50";
      default:
        return "text-gray-700 hover:bg-gray-50";
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-sm">
              {[
                "Customer",
                "Deal",
                "Date",
                "Time",
                "Party Size",
                "Status",
                "Actions",
              ].map((th) => (
                <th
                  key={th}
                  className="text-left py-4 px-4 text-gray-700 font-medium"
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking) => {
              const isRowLoading = loadingIds.has(booking._id);
              const actions = getAvailableActions(booking);

              return (
                <tr
                  key={booking._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {booking.user_id?.firstName} {booking.user_id?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user_id?.email}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">
                      {booking.deal_id?.deal_title || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      £{booking.deal_id?.deal_price || "-"}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-sm text-gray-700">
                    {formatDate(booking.time_slot_id?.start_time)}
                  </td>

                  <td className="py-4 px-4 text-sm text-gray-700">
                    {formatTime(booking.time_slot_id?.start_time)}
                  </td>

                  <td className="py-4 px-4 text-sm text-gray-700">
                    {booking.party_size} guests
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={booking.status} />
                  </td>

                  <td className="py-4 px-4 relative overflow-visible">
                    {actions.length > 0 ? (
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(booking._id)}
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          disabled={isRowLoading}
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>

                        {activeDropdown === booking._id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            {actions.map((actionObj, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  handleAction(actionObj.action, booking)
                                }
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${getActionStyle(
                                  actionObj.action
                                )} ${
                                  isRowLoading
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                } ${
                                  idx !== actions.length - 1
                                    ? "border-b border-gray-100"
                                    : ""
                                }`}
                                disabled={isRowLoading}
                              >
                                {actionObj.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4 border-t border-gray-200 text-sm">
          <div className="text-gray-600">
            Page {currentPage} of {totalPages} ({bookings.length} total)
          </div>
          <div className="flex flex-wrap gap-2">
            <PaginationButton
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </PaginationButton>

            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <PaginationButton
                  key={page}
                  page={page}
                  isActive={currentPage === page}
                  onClick={() => goToPage(page)}
                />
              );
            })}

            <PaginationButton
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
