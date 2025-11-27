// src/api/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const userApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const verify = axios.create({
  baseURL: `${BASE_URL}/authenticate`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ==================== REQUEST INTERCEPTOR ====================
// Attach token to every request
const attachTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        config.headers["x-auth-token"] = token;
        console.log("🔑 Token attached to request:", config.url);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// ==================== RESPONSE INTERCEPTOR ====================
// Handle token refresh automatically
const setupResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      console.log("🔍 Interceptor triggered:", {
        url: originalRequest?.url,
        status: error.response?.status,
        code: error.response?.data?.code,
        retry: originalRequest?._retry,
      });

      // Skip for auth endpoints
      if (
        originalRequest?.url?.includes("/authenticate") ||
        originalRequest?.url?.includes("/refresh") ||
        originalRequest?.url?.includes("/forgot-password") ||
        originalRequest?.url?.includes("/reset-password") ||
        originalRequest?.url?.includes("/verify-code") ||
        originalRequest?.url?.includes("/resend-code")
      ) {
        return Promise.reject(error);
      }

      // Check if token expired
      if (
        error.response?.data?.code === "TOKEN_EXPIRED" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        console.log("🔄 Token expired - attempting refresh...");

        try {
          // Get user role
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const isCustomer = user.role === "customer";

          let refreshRequestBody = {};

          // For customers, include refresh token in body
          if (isCustomer) {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }
            refreshRequestBody = { refreshToken };
            console.log("📱 Customer: Sending refresh token in body");
          } else {
            console.log("🍪 Restaurant Owner: Cookie will be sent");
          }

          // Call refresh endpoint
          const refreshResponse = await axios.post(
            `${BASE_URL}/user/refresh`,
            refreshRequestBody,
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );

          const newAccessToken = refreshResponse.data.accessToken;

          if (newAccessToken) {
            // Store new token
            localStorage.setItem("token", newAccessToken);

            // Update original request with new token
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            originalRequest.headers["x-auth-token"] = newAccessToken;

            console.log("✅ Token refreshed successfully");

            // Retry the original request with new token
            return instance(originalRequest);
          } else {
            throw new Error("No access token in refresh response");
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);

          // Clear auth and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("restaurantId");

          window.dispatchEvent(new Event("token-expired"));
          window.location.href = "/login";

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// ==================== SETUP ALL INTERCEPTORS ====================
[http, userApi, authApi, verify].forEach((instance) => {
  attachTokenInterceptor(instance);
  setupResponseInterceptor(instance);
});

console.log("✅ Axios interceptors configured");
