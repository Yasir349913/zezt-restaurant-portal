// src/api/api.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

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

// ==================== REFRESH TOKEN INTERCEPTOR ====================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  console.log(`📋 Processing queue: ${failedQueue.length} requests`, {
    error: !!error,
    token: !!token,
  });
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setupInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 🐛 DETAILED DEBUG LOG
      console.group("🔍 INTERCEPTOR TRIGGERED");
      console.log("Error Status:", error.response?.status);
      console.log("Error Data:", error.response?.data);
      console.log("Request URL:", originalRequest?.url);
      console.log("Already Retried?", originalRequest?._retry);
      console.groupEnd();

      // Check if token expired
      const isTokenExpired =
        error.response?.status === 401 &&
        (error.response?.data?.code === "TOKEN_EXPIRED" ||
          error.response?.data?.message?.toLowerCase().includes("expired") ||
          error.response?.data?.error?.toLowerCase().includes("expired"));

      console.log("🔍 Is Token Expired?", isTokenExpired);

      if (isTokenExpired && !originalRequest._retry) {
        console.log("🔄 TOKEN EXPIRED - Starting refresh flow");

        // If already refreshing, queue this request
        if (isRefreshing) {
          console.log("⏳ Refresh in progress - queuing request");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              console.log("✅ Queue processed - retrying with new token");
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              originalRequest.headers["x-auth-token"] = token;
              return instance(originalRequest);
            })
            .catch((err) => {
              console.error("❌ Queued request failed:", err);
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log(
            "🔄 Calling refresh endpoint:",
            `${BASE_URL}/auth/refresh`
          );

          // Check if we have the cookie
          console.log("🍪 Document cookies:", document.cookie);

          const refreshResponse = await axios.post(
            `${BASE_URL}/user/refresh`,
            {},
            {
              withCredentials: true,
              timeout: 10000,
            }
          );

          console.log("✅ REFRESH SUCCESS:", refreshResponse.data);

          const newAccessToken =
            refreshResponse.data.accessToken || refreshResponse.data.token;

          if (!newAccessToken) {
            throw new Error("No access token in refresh response");
          }

          console.log("💾 Storing new token in localStorage");
          localStorage.setItem("token", newAccessToken);

          // Update headers for all axios instances
          const bearer = `Bearer ${newAccessToken}`;
          [http, userApi, authApi, verify].forEach((inst) => {
            inst.defaults.headers.common["Authorization"] = bearer;
            inst.defaults.headers.common["x-auth-token"] = newAccessToken;
          });

          // Update the failed request with new token
          originalRequest.headers["Authorization"] = bearer;
          originalRequest.headers["x-auth-token"] = newAccessToken;

          // Process all queued requests
          processQueue(null, newAccessToken);

          isRefreshing = false;

          console.log("🔄 Retrying original request with new token");
          return instance(originalRequest);
        } catch (refreshError) {
          console.group("❌ REFRESH FAILED");
          console.error("Error:", refreshError.message);
          console.error("Response:", refreshError.response?.data);
          console.error("Status:", refreshError.response?.status);
          console.groupEnd();

          processQueue(refreshError, null);
          isRefreshing = false;

          // Check if it's a token issue or network issue
          const isAuthError =
            refreshError.response?.status === 401 ||
            refreshError.response?.status === 403;

          if (isAuthError) {
            console.log("🚪 Authentication error - logging out");

            // Clear everything
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            [http, userApi, authApi, verify].forEach((inst) => {
              delete inst.defaults.headers.common["Authorization"];
              delete inst.defaults.headers.common["x-auth-token"];
            });

            // Dispatch logout event
            console.log("📡 Dispatching 'token-expired' event");
            window.dispatchEvent(new Event("token-expired"));
          } else {
            console.warn(
              "⚠️ Network or server error during refresh - NOT logging out"
            );
          }

          return Promise.reject(refreshError);
        }
      }

      console.log("❌ Error not related to token expiry - rejecting");
      return Promise.reject(error);
    }
  );
};

// Setup interceptors on ALL instances
setupInterceptor(http);
setupInterceptor(userApi);
setupInterceptor(authApi);
setupInterceptor(verify);

console.log("✅ Axios interceptors configured");
