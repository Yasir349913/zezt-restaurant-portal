// src/api/services/Stripeservices.js
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/restaurant/stripe`;

// Internal restaurant ID storage (synced from context)
let currentRestaurantId = null;

// Get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Handle API errors
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// ✅ Export this for RestaurantContext
export const setRestaurantId = (id) => {
  currentRestaurantId = id;
  console.log("🆔 StripeService: Restaurant ID set to:", id);
};

// Get current restaurant ID
const getRestaurantId = () => {
  if (!currentRestaurantId) {
    // Fallback to localStorage if not set from context
    currentRestaurantId = localStorage.getItem("restaurantId");
  }

  if (!currentRestaurantId) {
    console.warn("⚠️ StripeService: Restaurant ID not found!");
  }

  return currentRestaurantId;
};

// ==================== STRIPE API SERVICES ====================
const StripeService = {
  // Set restaurant ID (for external use)
  setRestaurantId: (id) => {
    setRestaurantId(id);
  },

  // 1. Initiate Stripe Connect Onboarding
  initiateOnboarding: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      console.log("🚀 Initiating onboarding for restaurant:", restaurantId);

      const response = await fetch(`${API_BASE_URL}/onboard`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ restaurantId }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Onboarding error:", error);
      throw error;
    }
  },

  // 2. Verify Stripe Onboarding Completion (NEW)
  verifyOnboarding: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      console.log(
        "🔍 Verifying Stripe onboarding for restaurant:",
        restaurantId
      );

      const response = await fetch(`${API_BASE_URL}/verify-onboarding`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ restaurantId }),
      });

      const data = await handleResponse(response);
      console.log("✅ Onboarding verification response:", data);
      return data;
    } catch (error) {
      console.error("❌ Verify onboarding error:", error);
      throw error;
    }
  },

  // 3. Check Stripe Account Status
  checkStatus: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      console.log("🔍 Checking Stripe status for restaurant:", restaurantId);

      const response = await fetch(`${API_BASE_URL}/status/${restaurantId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      console.log("📊 Stripe Status Response:", data);
      return data;
    } catch (error) {
      console.error("❌ Status check error:", error);
      throw error;
    }
  },

  // 4. Get Restaurant Data with Stripe Info
  getRestaurantData: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      const response = await fetch(`${API_BASE_URL}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get restaurant data error:", error);
      throw error;
    }
  },

  // 5. Create Subscription
  createSubscription: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      const response = await fetch(`${API_BASE_URL}/create-subscription`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ restaurantId }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Create subscription error:", error);
      throw error;
    }
  },

  // 6. Cancel Subscription
  cancelSubscription: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      const response = await fetch(`${API_BASE_URL}/cancel-subscription`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ restaurantId }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Cancel subscription error:", error);
      throw error;
    }
  },

  // 7. Get Payment History
  getPaymentHistory: async () => {
    try {
      const restaurantId = getRestaurantId();
      if (!restaurantId) throw new Error("Restaurant ID not found");

      const response = await fetch(
        `${API_BASE_URL}/payment-history/${restaurantId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get payment history error:", error);
      throw error;
    }
  },
};

export default StripeService;
