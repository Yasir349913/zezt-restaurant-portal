// src/assets/Components/Layout/Settingslayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import EmailInputPopup from "../Settings/EmailInputpopup";
import PasswordChangePopup from "../Settings/Passwordchangepopup";
import EmailVerificationPopup from "../Settings/EmailVerificationPopup";
import StripeService from "../../../api/services/Stripeservices";
import { useRestaurant } from "../../../context/RestaurantContext";

// Remove SettingsNavigation from here
// import SettingsNavigation from "../Settings/Settingsnavigation";

const pathToTab = (pathname) => {
  if (pathname.endsWith("/restaurant")) return "Restaurant";
  if (pathname.endsWith("/account")) return "Account";
  if (pathname.endsWith("/notifications")) return "Notifications";
  if (pathname.endsWith("/billing")) return "Billing";
  return "Restaurant";
};

export default function Settingslayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRestaurantId } = useRestaurant();

  const [activeTab, setActiveTab] = useState(() =>
    pathToTab(location.pathname)
  );
  const [showPasswordPopup, setShowPasswordPopup] = useState(null);

  // Redirect to /settings/restaurant if only /settings is accessed
  useEffect(() => {
    if (
      location.pathname === "/settings" ||
      location.pathname === "/settings/"
    ) {
      navigate("/settings/restaurant", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Sync activeTab with URL (still required for internal logic)
  useEffect(() => {
    const t = pathToTab(location.pathname);
    setActiveTab(t);
  }, [location.pathname]);

  // Removed handleTabChange since navigation is removed
  // const handleTabChange = (tab) => {}

  const handleRestaurantSaved = async (restaurantId) => {
    console.log("🏪 Restaurant saved with ID:", restaurantId);

    if (!restaurantId) {
      console.error("❌ No restaurant ID provided");
      return;
    }

    if (typeof setRestaurantId === "function") {
      setRestaurantId(restaurantId);
    }
    localStorage.setItem("restaurantId", restaurantId);
    StripeService.setRestaurantId(restaurantId);

    try {
      const stripeStatus = await StripeService.checkStatus();
      const isStripeActive = stripeStatus?.accountActive === true;

      if (!isStripeActive) {
        navigate("/payments");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/payments");
    }
  };

  // Password popup handlers
  const handleChangePasswordClick = () => setShowPasswordPopup("email");

  const handleGetCode = (email) => {
    setShowPasswordPopup("verification");
  };

  const handleContinue = (code) => {
    setShowPasswordPopup("password");
  };

  const handleResend = () => {};

  const handleChangePassword = (passwords) => {
    setShowPasswordPopup(null);
    alert("Password changed successfully!");
  };

  const handleClosePopup = () => setShowPasswordPopup(null);

  return (
    <div className="xl:ml-64 pt-14 bg-gray-50 min-h-screen">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        {/* ❌ Removed navigation completely */}

        <div className="w-full">
          <Outlet context={{ onRestaurantSaved: handleRestaurantSaved }} />
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
