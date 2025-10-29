// src/components/payments/PaymentsLayout.jsx
import React from "react";
import RestaurantPaymentDashboard from "../Stripe/RestaurantPaymentDashboard";

/**
 * PaymentsLayout
 * - Main payments page in restaurant dashboard
 * - Shows Stripe status, subscription, and payment history
 */
export default function PaymentsLayout() {
  return (
    <div className="bg-gray-100 min-h-screen xl:ml-64 pt-14">
      {/* ✅ Just render our complete dashboard component */}
      <RestaurantPaymentDashboard />
    </div>
  );
}
