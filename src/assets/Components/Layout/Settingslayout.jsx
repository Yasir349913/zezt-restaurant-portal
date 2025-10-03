// src/assets/Components/Layout/Settingslayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SettingsNavigation from "../Settings/Settingsnavigation";
import RestaurantForm from "../Settings/RestaurantForm";
import EmailInputPopup from "../Settings/EmailInputpopup";
import PasswordChangePopup from "../Settings/Passwordchangepopup";
import EmailVerificationPopup from "../Settings/EmailVerificationPopup";
import NotificationsSettings from "../Settings/Settingsnotifications";
import BillingSettings from "../Settings/Billing";
import Accountinfo from "../Settings/Accountinfo";

/**
 * Settingslayout now:
 * - Renders <Outlet /> so nested routes mount inside it
 * - Keeps popups here
 * - Maintains activeTab for UI/indicator but derives it from location.pathname,
 *   so /settings/restaurant opens Restaurant tab automatically.
 */

const pathToTab = (pathname) => {
  if (pathname.endsWith("/restaurant")) return "Restaurant";
  if (pathname.endsWith("/account")) return "Account";
  if (pathname.endsWith("/notifications")) return "Notifications";
  if (pathname.endsWith("/billing")) return "Billing";
  // default when just /settings
  return "Restaurant";
};

export default function Settingslayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() =>
    pathToTab(location.pathname)
  );
  const [showPasswordPopup, setShowPasswordPopup] = useState(null);

  // keep local activeTab in sync with URL (handles manual URL nav)
  useEffect(() => {
    const t = pathToTab(location.pathname);
    setActiveTab(t);
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // navigate to corresponding child route under /settings
    const tabToPath = {
      Restaurant: "restaurant",
      Account: "account",
      Notifications: "notifications",
      Billing: "billing",
    };
    const path = tabToPath[tab] || "restaurant";
    navigate(`/settings/${path}`, { replace: false });
  };

  // password popup handlers (kept as in your original)
  const handleChangePasswordClick = () => setShowPasswordPopup("email");
  const handleGetCode = (email) => {
    console.log("Sending code to:", email);
    setShowPasswordPopup("verification");
  };
  const handleContinue = (code) => {
    console.log("Verification code:", code);
    setShowPasswordPopup("password");
  };
  const handleResend = () => {
    console.log("Resending verification code");
  };
  const handleChangePassword = (passwords) => {
    console.log("Changing password:", passwords);
    setShowPasswordPopup(null);
    alert("Password changed successfully!");
  };
  const handleClosePopup = () => setShowPasswordPopup(null);

  return (
    <div className="xl:ml-64 pt-14 bg-gray-50 min-h-screen">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        {/* pass activeTab and handler so nav UI highlights correctly */}
        <SettingsNavigation
          onTabChange={handleTabChange}
          activeTab={activeTab}
        />

        {/* Outlet will render nested child routes like /settings/restaurant */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>

      {/* Password Change Popups */}
      {showPasswordPopup === "email" && (
        <EmailInputPopup onClose={handleClosePopup} onGetCode={handleGetCode} />
      )}

      {showPasswordPopup === "verification" && (
        <EmailVerificationPopup
          onClose={handleClosePopup}
          onContinue={handleContinue}
          onResend={handleResend}
        />
      )}

      {showPasswordPopup === "password" && (
        <PasswordChangePopup
          onClose={handleClosePopup}
          onChangePassword={handleChangePassword}
        />
      )}
    </div>
  );
}
