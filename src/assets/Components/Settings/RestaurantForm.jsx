import React, { useState, useEffect } from "react";
import {
  createRestaurantProfile,
  fetchRestaurantProfile,
  updateRestaurantProfile,
} from "../../../api/Setting";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "../../../context/RestaurantContext";
import { useAuth } from "../../../context/AuthContext";
import StripeService from "../../../api/services/Stripeservices";

const RestaurantForm = () => {
  const navigate = useNavigate();
  const { setRestaurantId } = useRestaurant();
  const { user } = useAuth();

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
    status: "open",
  });

  // ✅ Error states for validation
  const [errors, setErrors] = useState({
    restaurantName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    cuisine: "",
    capacity: "",
    latitude: "",
    longitude: "",
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

          const longitude = restaurant.location?.coordinates?.[0] || "";
          const latitude = restaurant.location?.coordinates?.[1] || "";

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
            status: restaurant.status || "open",
          });

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

  // ✅ Validation functions
  const validateRestaurantName = (value) => {
    if (!value.trim()) return "Restaurant name is required";
    if (value.trim().length < 2)
      return "Restaurant name must be at least 2 characters";
    if (/^\d+$/.test(value)) return "Restaurant name cannot be only numbers";
    if (!/^[a-zA-Z0-9\s&'-]+$/.test(value))
      return "Restaurant name can only contain letters, numbers, spaces, &, ', and -";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) return "Phone number is required";
    // Remove spaces, dashes, parentheses for validation
    const cleanPhone = value.replace(/[\s\-()]/g, "");
    if (!/^[\+]?[0-9]+$/.test(cleanPhone))
      return "Phone number can only contain digits, +, -, (), and spaces";
    if (cleanPhone.length < 10)
      return "Phone number must be at least 10 digits";
    return "";
  };

  const validateCuisine = (value) => {
    if (!value.trim()) return ""; // Optional field
    if (/\d/.test(value)) return "Cuisine cannot contain numbers";
    if (!/^[a-zA-Z\s,&'-]+$/.test(value))
      return "Cuisine can only contain letters, spaces, commas, &, ', and -";
    return "";
  };

  const validateCapacity = (value) => {
    if (!value || value === "") return "Capacity is required";
    const numValue = Number(value);
    if (isNaN(numValue)) return "Capacity must be a number";
    if (numValue < 0) return "Capacity cannot be negative";
    if (numValue === 0) return "Capacity must be greater than 0";
    if (!Number.isInteger(numValue)) return "Capacity must be a whole number";
    return "";
  };

  const validateStreet = (value) => {
    if (!value.trim()) return "Street address is required";
    if (value.trim().length < 3)
      return "Street address must be at least 3 characters";
    if (!/^[a-zA-Z0-9\s,.'#-]+$/.test(value))
      return "Street can only contain letters, numbers, spaces, and common punctuation (,.'#-)";
    return "";
  };

  const validateCity = (value) => {
    if (!value.trim()) return "City is required";
    if (/\d/.test(value)) return "City name cannot contain numbers";
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return "City can only contain letters, spaces, ', and -";
    return "";
  };

  const validateState = (value) => {
    if (!value.trim()) return "State is required";
    if (/\d/.test(value)) return "State name cannot contain numbers";
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return "State can only contain letters, spaces, ', and -";
    return "";
  };

  const validateZipCode = (value) => {
    if (!value.trim()) return "Zip code is required";
    if (!/^[a-zA-Z0-9\s-]+$/.test(value))
      return "Zip code can only contain letters, numbers, spaces, and -";
    if (value.includes("-") && parseFloat(value) < 0)
      return "Zip code cannot be negative";
    return "";
  };

  const validateCountry = (value) => {
    if (!value.trim()) return "Country is required";
    if (/\d/.test(value)) return "Country name cannot contain numbers";
    if (!/^[a-zA-Z\s'-]+$/.test(value))
      return "Country can only contain letters, spaces, ', and -";
    return "";
  };

  const validateLatitude = (value) => {
    if (!value || value === "") return ""; // Optional field
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "Latitude must be a valid number";
    if (numValue < -90 || numValue > 90)
      return "Latitude must be between -90 and 90";
    return "";
  };

  const validateLongitude = (value) => {
    if (!value || value === "") return ""; // Optional field
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "Longitude must be a valid number";
    if (numValue < -180 || numValue > 180)
      return "Longitude must be between -180 and 180";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setErrors((prev) => ({ ...prev, [field]: "" }));
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));

      // Validate on change
      let error = "";
      if (field === "street") error = validateStreet(value);
      else if (field === "city") error = validateCity(value);
      else if (field === "state") error = validateState(value);
      else if (field === "zipCode") error = validateZipCode(value);
      else if (field === "country") error = validateCountry(value);

      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Validate on change
      let error = "";
      if (name === "restaurantName") error = validateRestaurantName(value);
      else if (name === "email") error = validateEmail(value);
      else if (name === "phone") error = validatePhone(value);
      else if (name === "cuisine") error = validateCuisine(value);
      else if (name === "capacity") error = validateCapacity(value);
      else if (name === "latitude") error = validateLatitude(value);
      else if (name === "longitude") error = validateLongitude(value);

      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: null });

    // ✅ Validate authentication
    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to create a restaurant. Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // ✅ Get owner ID from user context
    const ownerId = user._id || user.id;

    if (!ownerId) {
      setMessage({
        type: "error",
        text: "User ID not found. Please log in again.",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // ✅ Validate all fields before submit
    const newErrors = {
      restaurantName: validateRestaurantName(formData.restaurantName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      street: validateStreet(formData.address.street),
      city: validateCity(formData.address.city),
      state: validateState(formData.address.state),
      zipCode: validateZipCode(formData.address.zipCode),
      country: validateCountry(formData.address.country),
      cuisine: validateCuisine(formData.cuisine),
      capacity: validateCapacity(formData.capacity),
      latitude: validateLatitude(formData.latitude),
      longitude: validateLongitude(formData.longitude),
    };

    setErrors(newErrors);

    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (hasErrors) {
      setMessage({
        type: "error",
        text: "Please fix all validation errors before submitting",
      });
      return;
    }

    setIsLoading(true);

    try {
      const restaurantData = {
        name: formData.restaurantName,
        email: formData.email,
        phone: formData.phone,
        owner_id: ownerId,
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
        status: formData.status,
      };

      console.log("📤 Sending to backend:", restaurantData);

      let result;

      if (isEditing) {
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
        console.log("🏪 Creating restaurant...");
        result = await createRestaurantProfile(restaurantData);
        console.log("✅ Created successfully:", result);

        const restaurant = result?.restaurant || result?.data?.restaurant;
        const restaurantId = restaurant?._id || restaurant?.id;

        if (!restaurantId) {
          throw new Error("Restaurant ID not found in response");
        }

        console.log("💾 Saving restaurant ID:", restaurantId);

        if (typeof setRestaurantId === "function") {
          setRestaurantId(restaurantId);
        }
        localStorage.setItem("restaurantId", restaurantId);

        if (StripeService.setRestaurantId) {
          StripeService.setRestaurantId(restaurantId);
        }

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

      let errorMsg = `Failed to ${isEditing ? "update" : "create"} restaurant`;

      if (
        error?.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        errorMsg =
          "Validation failed:\n" + error.response.data.errors.join("\n");
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      console.error("📋 Final error message:", errorMsg);
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
          className={`mb-4 p-4 rounded-md whitespace-pre-line ${
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
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.restaurantName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.restaurantName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.restaurantName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +92 300 1234567"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cuisine</label>
              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                placeholder="e.g. Pakistani, Italian"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.cuisine ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.cuisine && (
                <p className="text-xs text-red-500 mt-1">{errors.cuisine}</p>
              )}
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
                placeholder="e.g. 50"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.capacity && (
                <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
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
                placeholder="e.g. 123 Main Street"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.street ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.street && (
                <p className="text-xs text-red-500 mt-1">{errors.street}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="e.g. Lahore"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="e.g. Punjab"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.state && (
                <p className="text-xs text-red-500 mt-1">{errors.state}</p>
              )}
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
                placeholder="e.g. 54000"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.zipCode ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.zipCode && (
                <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>
              )}
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
                placeholder="e.g. Pakistan"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.country ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.country && (
                <p className="text-xs text-red-500 mt-1">{errors.country}</p>
              )}
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
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.latitude ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.latitude && (
                <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>
              )}
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
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.longitude ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.longitude && (
                <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>
              )}
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
