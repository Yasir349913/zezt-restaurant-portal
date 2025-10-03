// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Authsidebar from "./Authsidebar";
import Loginform from "./Loginform";
import Forgetpassword from "./Forgetpassword";
import Account from "./Account";
import { useAuth } from "../../context/AuthContext";
import { fetchRestaurantProfile } from "../../api/Setting";
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

      console.log("=== LOGIN SUCCESSFUL ===");
      console.log("User logged in:", result.data?.user);

      try {
        const profile = await fetchRestaurantProfile();

        console.log("=== PROFILE FETCHED ===");
        console.log("Full profile:", JSON.stringify(profile, null, 2));
        console.log("Restaurant value:", profile?.restaurant);
        console.log("Restaurant type:", typeof profile?.restaurant);
        console.log("Restaurant is null:", profile?.restaurant === null);
        console.log("User role:", profile?.user?.role);

        // Check if restaurant exists
        // Handle both null and empty object cases
        const restaurant = profile?.restaurant;

        const hasRestaurant =
          restaurant !== null &&
          restaurant !== undefined &&
          typeof restaurant === "object" &&
          Object.keys(restaurant).length > 0;

        console.log("Has valid restaurant:", hasRestaurant);
        console.log(
          "Restaurant keys:",
          restaurant ? Object.keys(restaurant) : "N/A"
        );

        if (hasRestaurant) {
          // Restaurant exists - save ID and go to dashboard
          const restaurantId =
            restaurant._id || restaurant.id || restaurant.restaurantId;

          console.log("Extracted restaurant ID:", restaurantId);

          if (restaurantId) {
            if (typeof setRestaurantId === "function") {
              setRestaurantId(restaurantId);
            }
            localStorage.setItem("restaurantId", restaurantId);
            console.log("Restaurant ID saved to context and localStorage");
          } else {
            console.error(
              "Restaurant object exists but has no valid ID field!"
            );
            console.error("Restaurant object:", restaurant);
          }

          console.log("Redirecting to: /dashboard");
          navigate("/dashboard");
        } else {
          // No restaurant - go to create form
          console.log(
            "No restaurant found (null/undefined/empty object), redirecting to: /settings/restaurant"
          );
          navigate("/settings/restaurant");
        }
      } catch (fetchErr) {
        console.error("=== FETCH PROFILE ERROR ===");
        console.error("Error:", fetchErr);
        console.error("Error response:", fetchErr?.response?.data);

        const status = fetchErr?.response?.status || fetchErr?.status;
        if (status === 401) {
          setMessage({
            type: "error",
            text: "Authentication failed. Please login again.",
          });
          return;
        }

        console.log(
          "Profile fetch failed, assuming no restaurant. Redirecting to: /settings/restaurant"
        );
        navigate("/settings/restaurant");
      }
    } catch (err) {
      console.error("=== LOGIN ERROR ===");
      console.error(err);
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
