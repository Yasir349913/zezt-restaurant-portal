// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./assets/Pages/Login";
import DashLayout from "./assets/Components/Dashboard/Dashlayout";
import Dashboardlayout from "./assets/Components/Layout/Dashboardlayout";
import Settingslayout from "./assets/Components/Layout/Settingslayout";
import RestaurantForm from "./assets/Components/Settings/RestaurantForm";
import Dealslayout from "./assets/Components/Layout/Dealslayout";
import Bookingslayout from "./assets/Components/Layout/Bookingslayout";
import Analyticslayout from "./assets/Components/Layout/Analyticslayout";
import Messageslayout from "./assets/Components/Layout/Messageslayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<DashLayout />}>
          {/* Default dashboard */}
          <Route path="/" element={<Dashboardlayout />} />
          <Route path="/dashboard" element={<Dashboardlayout />} />

          {/* Deals page */}
          <Route path="/deals" element={<Dealslayout />} />

          {/* Bookings page */}
          <Route path="/bookings" element={<Bookingslayout />} />

          {/* Analytics page */}
          <Route path="/analytics" element={<Analyticslayout />} />

          {/* Messages page */}
          <Route path="/messages" element={<Messageslayout />} />

          {/* Settings routes */}
          <Route path="/settings" element={<Settingslayout />}>
            <Route index element={<div>Select a settings tab</div>} />
            <Route path="restaurant" element={<RestaurantForm />} />
          </Route>
        </Route>

        {/* Catch-all -> redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
