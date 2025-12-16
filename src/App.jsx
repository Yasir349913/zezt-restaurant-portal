// src/App.jsx
import React, { useEffect, useState } from "react";
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
import UserProfile from "./assets/Pages/UserProfile"; // ✅ ADD THIS IMPORT
import { SocketProvider } from "./context/SocketContext";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Give time for any pending token refresh to complete
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      console.log("🛡️ ProtectedRoute check:", {
        hasToken: !!token,
        hasUser: !!user,
        tokenPreview: token?.substring(0, 20) + "...",
      });

      setIsAuthenticated(!!(token && user));
      setChecking(false);
    };

    // Small delay to allow interceptor to complete any token refresh
    const timer = setTimeout(checkAuth, 50);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking
  if (checking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🚫 ProtectedRoute: No auth, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log("📡 Token expired event received - redirecting to login");
      // Force redirect to login
      window.location.href = "/login";
    };

    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, []);

  // Optional: Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        console.log(
          "🚪 Token removed from storage in another tab - redirecting"
        );
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
            <Route path="/profile" element={<UserProfile />} />{" "}
            {/* ✅ ADD THIS ROUTE */}
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
