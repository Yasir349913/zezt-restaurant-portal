// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/RestaurantContext";
import { initAuthFromStorage } from "./api/authHelpers";
import "./index.css";

// ← Call this BEFORE rendering to load token from localStorage
initAuthFromStorage();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RestaurantProvider>
        <App />
      </RestaurantProvider>
    </AuthProvider>
  </React.StrictMode>
);
