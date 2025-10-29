// src/assets/Components/Settings/RestaurantForm.jsx
import React, { useState, useEffect } from "react";
import {
  createRestaurantProfile,
  fetchRestaurantProfile,
  updateRestaurantProfile,
} from "../../../api/Setting";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "../../../context/RestaurantContext";
import StripeService from "../../../api/services/Stripeservices";

const RestaurantForm = () => {
  const navigate = useNavigate();
  const { setRestaurantId } = useRestaurant();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });

  const [formData, setFormData] = useState({
    restaurantName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    cuisine: "",
    capacity: "",
    description: "",
    latitude: "",
    longitude: "",
    status: "open", // ✅ Added status field
  });

  // ✅ Load existing restaurant
  useEffect(() => {
    const loadExistingRestaurant = async () => {
      try {
        console.log("🔍 Checking for existing restaurant...");
        const profile = await fetchRestaurantProfile();

        const restaurant = profile?.restaurant;

        if (restaurant && Object.keys(restaurant).length > 0) {
          console.log("✅ Existing restaurant found - EDIT MODE");
          console.log("Restaurant data:", restaurant);
          setIsEditing(true);

          // ✅ Extract latitude/longitude from location.coordinates
          const longitude = restaurant.location?.coordinates?.[0] || "";
          const latitude = restaurant.location?.coordinates?.[1] || "";

          // ✅ Map backend to frontend - ALL FIELDS
          setFormData({
            restaurantName: restaurant.name || "",
            email: restaurant.email || "",
            phone: restaurant.phone || "",
            address: {
              street: restaurant.address?.street || "",
              city: restaurant.address?.city || "",
              state: restaurant.address?.state || "",
              zipCode:
                restaurant.address?.zip || restaurant.address?.zipCode || "",
              country: restaurant.address?.country || "",
            },
            cuisine: Array.isArray(restaurant.cuisine)
              ? restaurant.cuisine.join(", ")
              : restaurant.cuisine || "",
            capacity: restaurant.total_capacity || restaurant.capacity || "",
            description: restaurant.description || "",
            latitude: latitude,
            longitude: longitude,
            status: restaurant.status || "open", // ✅ Map status
          });

          // Save restaurant ID
          const restaurantId = restaurant._id || restaurant.id;
          if (restaurantId) {
            localStorage.setItem("restaurantId", restaurantId);
            if (typeof setRestaurantId === "function") {
              setRestaurantId(restaurantId);
            }
            if (StripeService.setRestaurantId) {
              StripeService.setRestaurantId(restaurantId);
            }
          }
        } else {
          console.log("ℹ️ No restaurant - CREATE MODE");
          setIsEditing(false);
        }
      } catch (err) {
        console.log("ℹ️ CREATE MODE");
        console.error("Error:", err);
        setIsEditing(false);
      }
    };

    loadExistingRestaurant();
  }, [setRestaurantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: null });
    setIsLoading(true);

    try {
      // ✅ Map frontend to backend - ALL FIELDS
      const restaurantData = {
        name: formData.restaurantName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zip: formData.address.zipCode,
          country: formData.address.country,
        },
        cuisine: formData.cuisine
          ? formData.cuisine
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        total_capacity: parseInt(formData.capacity) || 0,
        description: formData.description,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(formData.longitude) || 0,
            parseFloat(formData.latitude) || 0,
          ],
        },
        status: formData.status, // ✅ Add status to backend data
      };

      console.log("📤 Sending to backend:", restaurantData);

      let result;

      if (isEditing) {
        // ============ UPDATE MODE ============
        console.log("✏️ Updating restaurant...");
        result = await updateRestaurantProfile(restaurantData);
        console.log("✅ Updated successfully:", result);

        setMessage({
          type: "success",
          text: "Restaurant updated successfully!",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // ============ CREATE MODE ============
        console.log("🏪 Creating restaurant...");
        result = await createRestaurantProfile(restaurantData);
        console.log("✅ Created successfully:", result);

        const restaurant = result?.restaurant;
        const restaurantId = restaurant?._id || restaurant?.id;

        if (!restaurantId) {
          throw new Error("Restaurant ID not found");
        }

        console.log("💾 Saving restaurant ID:", restaurantId);

        if (typeof setRestaurantId === "function") {
          setRestaurantId(restaurantId);
        }
        localStorage.setItem("restaurantId", restaurantId);

        if (StripeService.setRestaurantId) {
          StripeService.setRestaurantId(restaurantId);
        }

        // ============ CHECK STRIPE ============
        console.log("💳 Checking Stripe...");

        try {
          const stripeStatus = await StripeService.checkStatus();
          console.log("Stripe status:", stripeStatus);

          const isStripeActive =
            stripeStatus?.stripeAccountActive === true ||
            stripeStatus?.status === "active" ||
            stripeStatus?.active === true;

          if (!isStripeActive) {
            console.log("❌ Stripe NOT active → /payments");
            setMessage({
              type: "success",
              text: "Restaurant created! Please complete payment setup.",
            });

            setTimeout(() => {
              navigate("/payments");
            }, 1500);
          } else {
            console.log("✅ Stripe active → /dashboard");
            setMessage({
              type: "success",
              text: "Restaurant created successfully!",
            });

            setTimeout(() => {
              navigate("/dashboard");
            }, 1500);
          }
        } catch (stripeError) {
          console.error("❌ Stripe check failed:", stripeError);
          setMessage({
            type: "success",
            text: "Restaurant created! Please complete payment setup.",
          });

          setTimeout(() => {
            navigate("/payments");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("Error details:", error.response?.data);

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${isEditing ? "update" : "create"} restaurant`;

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Update Restaurant Profile" : "Create Restaurant Profile"}
      </h2>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cuisine</label>
              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                placeholder="e.g. Pakistani, Italian"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* ✅ Status Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="temporarily-closed">Temporarily Closed</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe your restaurant..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Street *</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Country *
              </label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Location Coordinates */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Location Coordinates</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 31.44247"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 74.1889"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Restaurant"
              : "Create Restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantForm;
