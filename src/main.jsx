// src/index.jsx (small change)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { RestaurantProvider } from "./context/RestaurantContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RestaurantProvider>
        {" "}
        {/* NEW wrapper */}
        <App />
      </RestaurantProvider>
    </AuthProvider>
  </React.StrictMode>
);
