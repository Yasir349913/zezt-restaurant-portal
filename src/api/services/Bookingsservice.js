// src/api/services/Bookingsservice.js
import { http } from "../api";

let RESTAURANT_ID = null;

export const setRestaurantId = (id) => {
  RESTAURANT_ID = id;
};

export const getRestaurantId = () => RESTAURANT_ID;

// ==================== BOOKING DASHBOARD API ====================

/**
 * Fetch booking dashboard data with filters
 * @param {string} restaurantId - Restaurant ID
 * @param {object} filters - { startDate?, endDate?, status? }
 */
export const fetchBookingDashboardData = async (restaurantId, filters = {}) => {
  try {
    const id = restaurantId ?? RESTAURANT_ID;
    if (!id) throw new Error("restaurantId is required");

    // Validate ObjectID format (24 hex characters)
    if (!/^[a-f\d]{24}$/i.test(id)) {
      throw new Error(
        "Invalid restaurant ID format. Must be 24 hexadecimal characters."
      );
    }

    // Build query params
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.status) params.append("status", filters.status);

    const queryString = params.toString();
    // ✅ FIXED: Match backend route /:restaurantId/dashboard
    const url = queryString
      ? `/booking/${id}/dashboard?${queryString}`
      : `/booking/${id}/dashboard`;

    console.log("📡 Fetching booking dashboard:", url);

    const { data } = await http.get(url);
    return data;
  } catch (error) {
    console.error("❌ Booking Dashboard API Error:", {
      endpoint: `/booking/${restaurantId}/dashboard`,
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message,
      fullError: error.response?.data,
    });

    // Throw a more user-friendly error
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to fetch booking dashboard data";

    throw new Error(errorMessage);
  }
};

/**
 * Cancel a booking (with refund if confirmed)
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 */
export const cancelBooking = async (bookingId, reason = "") => {
  try {
    if (!bookingId) throw new Error("Booking ID is required");

    console.log("📡 Cancelling booking:", bookingId);

    const { data } = await http.patch(`/booking/cancel/${bookingId}`, {
      reason,
    });

    return data;
  } catch (error) {
    console.error("❌ Cancel Booking Error:", {
      bookingId,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to cancel booking";

    throw new Error(errorMessage);
  }
};

/**
 * Mark booking as no-show
 * @param {string} bookingId - Booking ID
 */
export const markBookingNoShow = async (bookingId) => {
  try {
    if (!bookingId) throw new Error("Booking ID is required");

    console.log("📡 Marking booking as no-show:", bookingId);

    const { data } = await http.patch(`/booking/noshow/${bookingId}`);

    return data;
  } catch (error) {
    console.error("❌ Mark No-Show Error:", {
      bookingId,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to mark booking as no-show";

    throw new Error(errorMessage);
  }
};

/**
 * Mark booking as completed
 * @param {string} bookingId - Booking ID
 */
export const markBookingCompleted = async (bookingId) => {
  try {
    if (!bookingId) throw new Error("Booking ID is required");

    console.log("📡 Marking booking as completed:", bookingId);

    const { data } = await http.patch(`/booking/completed/${bookingId}`);

    return data;
  } catch (error) {
    console.error("❌ Mark Completed Error:", {
      bookingId,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to mark booking as completed";

    throw new Error(errorMessage);
  }
};
