// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Authsidebar from "./Authsidebar";
import Loginform from "./Loginform";
import Forgetpassword from "./Forgetpassword";
import Account from "./Account";
import { useAuth } from "../../context/AuthContext";
import { fetchRestaurantProfile } from "../../api/Setting";
import StripeService from "../../api/services/Stripeservices";

import { useRestaurant } from "../../context/RestaurantContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setRestaurantId } = useRestaurant();

  const [showForget, setShowForget] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [fieldErrors, setFieldErrors] = useState({});

  const normalizeError = (err) => {
    const data = err || {};
    if (data.error) return { message: data.error };
    if (data.message) return { message: data.message };
    if (data.errors) {
      const fields = {};
      for (const [k, v] of Object.entries(data.errors)) {
        fields[k] = Array.isArray(v) ? v[0] : String(v);
      }
      return { message: "Validation error", fields };
    }
    return { message: "Something went wrong" };
  };

  const handleLogin = async ({ email, password }) => {
    if (!email || !password) {
      setMessage({ type: "error", text: "Please enter email and password." });
      return;
    }

    setMessage({ type: null, text: null });
    setFieldErrors({});
    setLoading(true);

    try {
      // ============ STEP 1: LOGIN ============
      console.log("🔐 Step 1: Logging in...");
      const result = await login({ email, password });

      if (!result.ok) {
        const norm = normalizeError(result.raw || { message: result.error });
        if (norm.fields) setFieldErrors(norm.fields);
        setMessage({ type: "error", text: norm.message || result.error });
        return;
      }

      console.log("✅ Login successful");

      // ============ STEP 2: CHECK RESTAURANT ============
      console.log("🏪 Step 2: Checking restaurant profile...");

      try {
        const profile = await fetchRestaurantProfile();
        console.log("📄 Profile fetched:", profile);

        const restaurant = profile?.restaurant;
        const hasRestaurant =
          restaurant !== null &&
          restaurant !== undefined &&
          typeof restaurant === "object" &&
          Object.keys(restaurant).length > 0;

        if (!hasRestaurant) {
          // ❌ NO RESTAURANT -> Create restaurant
          console.log("❌ No restaurant found");
          console.log("➡️ Redirecting to /settings/restaurant");
          navigate("/settings/restaurant");
          return;
        }

        // ✅ RESTAURANT EXISTS
        console.log("✅ Restaurant exists:", restaurant);

        // Save restaurant ID
        const restaurantId =
          restaurant._id || restaurant.id || restaurant.restaurantId;

        if (!restaurantId) {
          console.error("❌ No restaurant ID found in profile");
          navigate("/settings/restaurant");
          return;
        }

        console.log("💾 Saving restaurant ID:", restaurantId);

        // Set in context
        if (typeof setRestaurantId === "function") {
          setRestaurantId(restaurantId);
        }

        // Set in localStorage
        localStorage.setItem("restaurantId", restaurantId);

        // ✅ Set in StripeService
        StripeService.setRestaurantId(restaurantId);

        // ============ STEP 3: CHECK STRIPE STATUS ============
        console.log("💳 Step 3: Checking Stripe status...");

        try {
          const stripeStatus = await StripeService.checkStatus();
          console.log("📊 Stripe Status Response:", stripeStatus);

          // ✅ Check backend response property: accountActive
          const isStripeActive = stripeStatus?.accountActive === true;

          console.log("🔍 Detailed Status Check:");
          console.log("  - success:", stripeStatus?.success);
          console.log("  - connected:", stripeStatus?.connected);
          console.log("  - accountActive:", stripeStatus?.accountActive);
          console.log("  ✅ Final isStripeActive:", isStripeActive);

          if (!isStripeActive) {
            // ❌ STRIPE NOT ACTIVE -> Go to payments
            console.log("❌ Stripe account NOT active");
            console.log("➡️ Redirecting to /payments");
            navigate("/payments");
          } else {
            // ✅ STRIPE ACTIVE -> Go to dashboard
            console.log("✅ Stripe account active");
            console.log("➡️ Redirecting to /dashboard");
            navigate("/dashboard");
          }
        } catch (stripeError) {
          console.error("❌ Stripe status check failed:", stripeError);
          console.log("⚠️ Stripe check error, redirecting to /payments");
          navigate("/payments");
        }
      } catch (profileError) {
        console.error("❌ Profile fetch error:", profileError);

        const status = profileError?.response?.status || profileError?.status;
        if (status === 401) {
          setMessage({
            type: "error",
            text: "Authentication failed. Please login again.",
          });
          return;
        }

        // If profile fetch fails, assume no restaurant
        console.log(
          "⚠️ Profile fetch failed, redirecting to /settings/restaurant"
        );
        navigate("/settings/restaurant");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      const norm = normalizeError(err?.response?.data || err);
      if (norm.fields) setFieldErrors(norm.fields);
      setMessage({ type: "error", text: norm.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Authsidebar />

      {showForget ? (
        <Forgetpassword setShowForget={setShowForget} />
      ) : showAccount ? (
        <Account setShowAccount={setShowAccount} />
      ) : (
        <Loginform
          setShowForget={setShowForget}
          setShowAccount={setShowAccount}
          onSubmit={handleLogin}
          loading={loading}
          message={message}
          fieldErrors={fieldErrors}
        />
      )}
    </div>
  );
};

export default Login;
