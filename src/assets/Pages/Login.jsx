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
      const result = await login({ email, password });

      if (!result.ok) {
        const norm = normalizeError(result.raw || { message: result.error });
        if (norm.fields) setFieldErrors(norm.fields);
        setMessage({ type: "error", text: norm.message || result.error });
        return;
      }

      const profile = await fetchRestaurantProfile();
      const restaurant = profile?.restaurant;
      const hasRestaurant =
        restaurant &&
        typeof restaurant === "object" &&
        Object.keys(restaurant).length > 0;

      if (!hasRestaurant) {
        navigate("/settings/restaurant");
        return;
      }

      const restaurantId =
        restaurant._id || restaurant.id || restaurant.restaurantId;
      if (!restaurantId) {
        navigate("/settings/restaurant");
        return;
      }

      if (typeof setRestaurantId === "function") setRestaurantId(restaurantId);
      localStorage.setItem("restaurantId", restaurantId);
      StripeService.setRestaurantId(restaurantId);

      const stripeStatus = await StripeService.checkStatus();
      const isStripeActive = stripeStatus?.accountActive === true;

      if (!isStripeActive) {
        navigate("/payments");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const norm = normalizeError(err?.response?.data || err);
      if (norm.fields) setFieldErrors(norm.fields);
      setMessage({ type: "error", text: norm.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar hidden on small screens */}
      <div className="hidden md:flex md:w-1/2">
        <Authsidebar />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 md:px-12">
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
    </div>
  );
};

export default Login;
