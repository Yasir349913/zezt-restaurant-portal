// src/pages/settings/RestaurantForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchRestaurantProfile,
  createRestaurantProfile,
} from "../../../api/Setting";
import { attachTokenToApis } from "../../../api/authHelpers";
import {
  validateEmail,
  validatePhone,
} from "../../../api/services/settingsServices";
import { useRestaurant } from "../../../context/RestaurantContext";

/**
 * Extract user id from a JWT stored in localStorage.
 * Accepts either the raw token or "Bearer <token>".
 * Returns _id | id | userId or null.
 */
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const raw = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    const payload = raw.split(".")[1];
    if (!payload) return null;
    // base64 decode (browser)
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded._id || decoded.id || decoded.userId || null;
  } catch (err) {
    console.warn("Failed to parse token payload:", err);
    return null;
  }
};

const RestaurantForm = () => {
  const navigate = useNavigate();

  // get setter from RestaurantContext
  const { setRestaurantId } = useRestaurant();

  const [loading, setLoading] = useState(true);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    phone: "",
    email: "",
    cuisine: "",
    description: "",
    status: "open",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchRestaurantProfile();
        if (!mounted) return;
        setUser(data.user || null);

        if (data.restaurant) {
          setHasRestaurant(true);

          // set context (and localStorage via provider) so dashboard can use it
          const existingId =
            data.restaurant._id ||
            data.restaurant.id ||
            data.restaurant.restaurantId ||
            null;
          if (existingId && typeof setRestaurantId === "function") {
            try {
              setRestaurantId(existingId);
            } catch (e) {
              console.warn("Failed to set restaurant id in context:", e);
            }
          }
        } else {
          setHasRestaurant(false);
          setForm((prev) => ({ ...prev, email: data.user?.email || "" }));
        }
      } catch (e) {
        console.error("Error fetching restaurant profile:", e);
        const status = e?.status || e?.response?.status;
        if (status === 401) {
          navigate("/login");
        } else {
          setServerMessage("Failed to load profile. Try again later.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate, setRestaurantId]);

  const setField = (path, value) => {
    if (path.startsWith("address.")) {
      const key = path.split(".")[1];
      setForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
      if (errors.address?.[key])
        setErrors((p) => ({ ...p, address: { ...p.address, [key]: "" } }));
    } else {
      setForm((p) => ({ ...p, [path]: value }));
      if (errors[path]) setErrors((p) => ({ ...p, [path]: "" }));
    }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Restaurant name is required";

    e.address = {};
    if (!form.address.street?.trim()) e.address.street = "Street is required";
    if (!form.address.city?.trim()) e.address.city = "City is required";
    if (!form.address.state?.trim()) e.address.state = "State is required";
    if (!form.address.zip?.trim()) e.address.zip = "ZIP is required";
    if (!form.address.country?.trim())
      e.address.country = "Country is required";
    if (Object.values(e.address).every((v) => !v)) delete e.address;

    if (!form.phone?.trim()) e.phone = "Phone is required";
    else if (!validatePhone(form.phone))
      e.phone = "Please enter a valid phone number";

    if (!form.email?.trim()) e.email = "Email is required";
    else if (!validateEmail(form.email))
      e.email = "Please enter a valid email address";

    const lat = Number(form.latitude);
    const lon = Number(form.longitude);
    if (Number.isNaN(lat)) e.latitude = "Latitude must be a valid number";
    if (Number.isNaN(lon)) e.longitude = "Longitude must be a valid number";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setServerMessage(null);

    try {
      const cuisinesArray = form.cuisine
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        address: { ...form.address },
        phone: form.phone,
        email: form.email,
        cuisine: cuisinesArray,
        description: form.description,
        status: form.status,
        location: {
          type: "Point",
          coordinates: [Number(form.longitude), Number(form.latitude)],
        },
      };

      // If backend requires ownerId in body, extract it from token and attach.
      const storedToken = localStorage.getItem("token");
      const ownerId = getUserIdFromToken(storedToken);
      if (ownerId) {
        payload.owner_id = ownerId;
      } else {
        setServerMessage(
          "Not logged in or session expired. Please log in again."
        );
        attachTokenToApis(null);
        navigate("/login");
        setSubmitting(false);
        return;
      }

      const res = await createRestaurantProfile(payload);

      // Debug: Log the full response to understand its structure
      console.log("=== CREATE RESTAURANT RESPONSE ===");
      console.log("Full response:", res);
      console.log("Response type:", typeof res);
      console.log("Response keys:", res ? Object.keys(res) : "null");
      console.log("Stringified:", JSON.stringify(res, null, 2));

      if (res?.token) {
        attachTokenToApis(res.token);
      }

      // Try multiple ways to extract restaurant ID from various response structures
      let createdId = null;

      // Strategy 1: Check res.restaurant object
      if (res?.restaurant) {
        createdId =
          res.restaurant._id ||
          res.restaurant.id ||
          res.restaurant.restaurantId;
        console.log("Strategy 1 (res.restaurant):", createdId);
      }

      // Strategy 2: Check if response IS the restaurant object (no wrapper)
      if (!createdId && res && typeof res === "object") {
        createdId = res._id || res.id || res.restaurantId;
        console.log("Strategy 2 (res directly):", createdId);
      }

      // Strategy 3: Check res.data.restaurant
      if (!createdId && res?.data?.restaurant) {
        createdId =
          res.data.restaurant._id ||
          res.data.restaurant.id ||
          res.data.restaurant.restaurantId;
        console.log("Strategy 3 (res.data.restaurant):", createdId);
      }

      // Strategy 4: Check res.data directly
      if (!createdId && res?.data && typeof res.data === "object") {
        createdId = res.data._id || res.data.id || res.data.restaurantId;
        console.log("Strategy 4 (res.data):", createdId);
      }

      console.log("Final extracted ID:", createdId);

      if (!createdId) {
        console.error(
          "Could not extract restaurant ID from response structure"
        );
        console.error("Response was:", res);

        // Don't fail completely - set a warning but continue
        setServerMessage(
          "Restaurant created, but couldn't extract ID. Please refresh the page."
        );

        // Try to refetch profile to get the ID
        try {
          const refreshed = await fetchRestaurantProfile();
          if (refreshed?.restaurant) {
            const refreshedId =
              refreshed.restaurant._id ||
              refreshed.restaurant.id ||
              refreshed.restaurant.restaurantId;
            if (refreshedId) {
              createdId = refreshedId;
              console.log("Got ID from refetch:", createdId);
            }
          }
        } catch (refetchErr) {
          console.warn("Refetch also failed:", refetchErr);
        }

        // If we still don't have an ID, just navigate and let dashboard handle it
        if (!createdId) {
          setHasRestaurant(true);
          await new Promise((resolve) => setTimeout(resolve, 150));
          navigate("/dashboard");
          return;
        }
      }

      // We have a valid ID - store it
      if (typeof setRestaurantId === "function") {
        setRestaurantId(createdId);

        // Double-ensure localStorage is set immediately
        try {
          localStorage.setItem("restaurantId", createdId);
          console.log("Saved restaurant ID to localStorage:", createdId);
        } catch (storageErr) {
          console.warn("Could not write to localStorage:", storageErr);
        }
      }

      setHasRestaurant(true);
      setServerMessage("Restaurant profile created successfully!");

      // Small delay to ensure context propagates before navigation
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("create restaurant error:", err);
      const msg =
        err?.message ||
        err?.error ||
        err?.response?.data?.message ||
        "Failed to create restaurant";
      setServerMessage(msg);

      // map backend validation errors to frontend fields if present
      const backendErrors = err?.response?.data?.errors || err?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        const fieldErrs = {};
        for (const [k, v] of Object.entries(backendErrors)) {
          fieldErrs[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors((prev) => ({ ...prev, ...fieldErrs }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-4xl ml-8 flex items-center justify-center"
        style={{ minHeight: 600 }}
      >
        <div className="text-gray-500">Loading restaurant profile...</div>
      </div>
    );
  }

  if (hasRestaurant) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-4xl ml-8">
        <h2 className="text-lg font-semibold mb-2">
          Restaurant profile already exists
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          You already have a restaurant profile.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-4xl ml-8">
      {serverMessage && (
        <div className="mb-4 text-sm px-3 py-2 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
          {serverMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine (comma-separated)
          </label>
          <input
            type="text"
            value={form.cuisine}
            onChange={(e) => setField("cuisine", e.target.value)}
            placeholder="e.g. Pakistani, BBQ"
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Address */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street *
          </label>
          <input
            type="text"
            value={form.address.street}
            onChange={(e) => setField("address.street", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.address?.street ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.address?.street && (
            <p className="text-red-500 text-xs mt-1">{errors.address.street}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            value={form.address.city}
            onChange={(e) => setField("address.city", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.address?.city ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.address?.city && (
            <p className="text-red-500 text-xs mt-1">{errors.address.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            value={form.address.state}
            onChange={(e) => setField("address.state", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.address?.state ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.address?.state && (
            <p className="text-red-500 text-xs mt-1">{errors.address.state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP *
          </label>
          <input
            type="text"
            value={form.address.zip}
            onChange={(e) => setField("address.zip", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.address?.zip ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.address?.zip && (
            <p className="text-red-500 text-xs mt-1">{errors.address.zip}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            value={form.address.country}
            onChange={(e) => setField("address.country", e.target.value)}
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.address?.country ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.address?.country && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.country}
            </p>
          )}
        </div>
      </div>

      {/* Geo + Description + Status */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude *
          </label>
          <input
            type="number"
            value={form.latitude}
            onChange={(e) => setField("latitude", e.target.value)}
            placeholder="e.g. 31.41344"
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.latitude ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.latitude && (
            <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude *
          </label>
          <input
            type="number"
            value={form.longitude}
            onChange={(e) => setField("longitude", e.target.value)}
            placeholder="e.g. 74.17685"
            className={`w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.longitude ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.longitude && (
            <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Enter Description"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 resize-none placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="w-full h-11 bg-red-400 hover:bg-red-500 text-white text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creating..." : "Create Profile"}
        </button>
      </div>
    </div>
  );
};

export default RestaurantForm;
