// src/assets/Components/Layout/Settingslayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SettingsNavigation from "../Settings/Settingsnavigation";
import EmailInputPopup from "../Settings/EmailInputpopup";
import PasswordChangePopup from "../Settings/Passwordchangepopup";
import EmailVerificationPopup from "../Settings/EmailVerificationPopup";
import StripeService from "../../../api/services/Stripeservices";
import { useRestaurant } from "../../../context/RestaurantContext";

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

  // ✅ NEW: Redirect to restaurant tab if only /settings is accessed
  useEffect(() => {
    if (location.pathname === "/settings" || location.pathname === "/settings/") {
      navigate("/settings/restaurant", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Keep local activeTab in sync with URL
  useEffect(() => {
    const t = pathToTab(location.pathname);
    setActiveTab(t);
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const tabToPath = {
      Restaurant: "restaurant",
      Account: "account",
      Notifications: "notifications",
      Billing: "billing",
    };
    const path = tabToPath[tab] || "restaurant";
    navigate(`/settings/${path}`, { replace: false });
  };

  // ✅ NEW: Handle Restaurant Save & Stripe Check
  const handleRestaurantSaved = async (restaurantId) => {
    console.log("🏪 Restaurant saved with ID:", restaurantId);

    if (!restaurantId) {
      console.error("❌ No restaurant ID provided");
      return;
    }

    // Save restaurant ID
    console.log("💾 Saving restaurant ID in context and localStorage");

    if (typeof setRestaurantId === "function") {
      setRestaurantId(restaurantId);
    }
    localStorage.setItem("restaurantId", restaurantId);
    StripeService.setRestaurantId(restaurantId);

    // Check Stripe status
    console.log("💳 Checking Stripe status...");

    try {
      const stripeStatus = await StripeService.checkStatus();
      console.log("📊 Stripe Status:", stripeStatus);

      const isStripeActive = stripeStatus?.accountActive === true;
      console.log("✅ Is Stripe Active:", isStripeActive);

      if (!isStripeActive) {
        console.log("❌ Stripe not active -> Redirecting to /payments");
        navigate("/payments");
      } else {
        console.log("✅ Stripe active -> Redirecting to /dashboard");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("❌ Stripe check failed:", error);
      console.log("⚠️ Redirecting to /payments due to error");
      navigate("/payments");
    }
  };

  // Password popup handlers
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

        <SettingsNavigation
          onTabChange={handleTabChange}
          activeTab={activeTab}
        />

        {/* ✅ Pass handleRestaurantSaved to nested routes via context */}
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