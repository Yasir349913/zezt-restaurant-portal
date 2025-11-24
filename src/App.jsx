// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotificationToast from "./assets/Components/Notifications/NotificationToast";

import Login from "./assets/Pages/Login";
import DashLayout from "./assets/Components/Dashboard/Dashlayout";
import Dashboardlayout from "./assets/Components/Layout/Dashboardlayout";
import Settingslayout from "./assets/Components/Layout/Settingslayout";
import RestaurantForm from "./assets/Components/Settings/RestaurantForm";
import Dealslayout from "./assets/Components/Layout/Dealslayout";
import Bookingslayout from "./assets/Components/Layout/Bookingslayout";
import Analyticslayout from "./assets/Components/Layout/Analyticslayout";
import Messageslayout from "./assets/Components/Layout/Messageslayout";
import PaymentsLayout from "./assets/Components/Layout/Paymentslayout";
import StripeSuccessPage from "./assets/Components/Stripe/StripeSuccessPage";
import SubscriptionSuccessPage from "./assets/Components/Stripe/SubscriptionSuccessPage";
import RevenueLayout from "./assets/Components/Layout/Revenuelayout";
import Occupancylayout from "./assets/Components/Layout/Occupancylayout";
import Notificationslayout from "./assets/Components/Layout/Notificationlayout";
import HotDealsLayout from "./assets/Components/Layout/Hotdealslayout";
import StripeCallback from "./assets/Components/Stripe/StripeCallback";
import StripeRefresh from "./assets/Components/Stripe/StripeRefresh";
import { SocketProvider } from "./context/SocketContext";

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/subscription/complete"
            element={<SubscriptionSuccessPage />}
          />
          <Route path="/stripe/callback" element={<StripeCallback />} />
          <Route path="/stripe/refresh" element={<StripeRefresh />} />
          <Route path="/stripe/success" element={<StripeSuccessPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboardlayout />} />
            <Route path="/deals" element={<Dealslayout />} />
            <Route path="/hot-deals" element={<HotDealsLayout />} />
            <Route path="/bookings" element={<Bookingslayout />} />
            <Route path="/analytics" element={<Analyticslayout />} />
            <Route path="/messages" element={<Messageslayout />} />
            <Route path="/payments" element={<PaymentsLayout />} />
            <Route path="/revenue" element={<RevenueLayout />} />
            <Route path="/occupancy" element={<Occupancylayout />} />
            <Route path="/notifications" element={<Notificationslayout />} />
            <Route path="/settings" element={<Settingslayout />}>
              <Route index element={<div>Select a settings tab</div>} />
              <Route path="restaurant" element={<RestaurantForm />} />
            </Route>
          </Route>

          {/* Default route - redirect based on auth status */}
          <Route
            path="/"
            element={
              localStorage.getItem("token") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all - redirect based on auth status */}
          <Route
            path="*"
            element={
              localStorage.getItem("token") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
        <NotificationToast />
      </BrowserRouter>
    </SocketProvider>
  );
}
