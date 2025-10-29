// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
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

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        {" "}
        {/* ✅ Wrap everything */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/subscription/complete"
            element={<SubscriptionSuccessPage />}
          />

          <Route element={<DashLayout />}>
            <Route path="/dashboard" element={<Dashboardlayout />} />
            <Route path="/deals" element={<Dealslayout />} />
            <Route path="/hot-deals" element={<HotDealsLayout />} />
            <Route path="/bookings" element={<Bookingslayout />} />
            <Route path="/analytics" element={<Analyticslayout />} />
            <Route path="/messages" element={<Messageslayout />} />
            <Route path="/payments" element={<PaymentsLayout />} />
            <Route path="/revenue" element={<RevenueLayout />} />
            <Route path="/occupancy" element={<Occupancylayout />} />
            <Route
              path="/notifications"
              element={<Notificationslayout />}
            />{" "}
            {/* ✅ Already there */}
            <Route path="/settings" element={<Settingslayout />}>
              <Route index element={<div>Select a settings tab</div>} />
              <Route path="restaurant" element={<RestaurantForm />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {/* ✅ Add toast notifications globally */}
        <NotificationToast />
      </NotificationProvider>
    </BrowserRouter>
  );
}
