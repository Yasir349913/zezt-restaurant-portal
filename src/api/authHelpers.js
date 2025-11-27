// src/api/authHelpers.js

/**
 * Attach access token to axios instances
 * NOTE: This is kept for backward compatibility
 * Request interceptor now handles token attachment automatically
 */
export const attachTokenToApis = (accessToken) => {
  console.log(
    "[attachTokenToApis] Called (legacy):",
    accessToken ? "YES" : "NO"
  );

  // Just store in localStorage, interceptor will handle the rest
  if (accessToken) {
    try {
      localStorage.setItem("token", accessToken);
      console.log("[attachTokenToApis] Token stored in localStorage");
    } catch (err) {
      console.warn("[attachTokenToApis] Failed to store token:", err);
    }
  } else {
    try {
      localStorage.removeItem("token");
      console.log("[attachTokenToApis] Token removed from localStorage");
    } catch (err) {
      /* ignore */
    }
  }
};

/**
 * Store refresh token for customers
 */
export const storeRefreshToken = (refreshToken, userRole) => {
  if (!refreshToken) {
    console.log("[storeRefreshToken] No refresh token provided");
    return;
  }

  if (userRole === "customer") {
    try {
      localStorage.setItem("refreshToken", refreshToken);
      console.log("[storeRefreshToken] ✅ Stored refresh token for customer");
    } catch (err) {
      console.error("[storeRefreshToken] ❌ Error:", err);
    }
  } else {
    console.log("[storeRefreshToken] ⏭️ Restaurant owner uses cookie");
  }
};

/**
 * Remove all client-side auth state
 */
export const clearClientAuth = () => {
  console.log("[clearClientAuth] Clearing all auth data...");

  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("selectedRestaurant");
    console.log("[clearClientAuth] ✅ All auth data cleared");
  } catch (e) {
    console.error("[clearClientAuth] ❌ Error:", e);
  }
};

/**
 * Initialize axios defaults from storage (legacy)
 * Request interceptor now handles this automatically
 */
export const initAuthFromStorage = () => {
  console.log("[initAuthFromStorage] Called (legacy - not needed)");
  // This function is now a no-op since request interceptor handles everything
};
