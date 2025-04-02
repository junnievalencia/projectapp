import { boot } from "quasar/wrappers";
import axios from "axios";
import { Notify } from "quasar";

// Create an axios instance with the base URL of our API
const api = axios.create({
  baseURL: "http://localhost:5001/api", // Updated to match backend port (5001)
});

// Function to check if app is in mock mode
const isMockMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("mock") === "true";
};

// Add request interceptor for adding auth tokens and handling mock mode
api.interceptors.request.use(
  (config) => {
    // Add authorization token if it exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log("REQUEST:", {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and handling common errors
api.interceptors.response.use(
  (response) => {
    console.log("RESPONSE:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    // Log the error response
    console.error("Response error:", error.response || error);

    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;

      // Handle unauthorized errors
      if (status === 401) {
        // Only show notification if not in mock mode
        if (!isMockMode()) {
          Notify.create({
            type: "negative",
            message: "Session expired. Please log in again.",
            icon: "error",
          });

          // Clear tokens
          localStorage.removeItem("token");
          localStorage.removeItem("userData");

          // Redirect to login page if not already there
          if (!window.location.pathname.startsWith("/auth/login")) {
            setTimeout(() => {
              window.location.href = "/#/auth/login";
            }, 1500);
          }
        }
      }
      // Handle forbidden errors
      else if (status === 403) {
        Notify.create({
          type: "negative",
          message: "You do not have permission to perform this action.",
          icon: "block",
        });
      }
      // Handle server errors
      else if (status >= 500) {
        Notify.create({
          type: "negative",
          message: "Server error. Please try again later.",
          icon: "error",
        });
      }
    } else if (error.request) {
      // Network error - server not responding
      if (!isMockMode()) {
        Notify.create({
          type: "negative",
          message: "Cannot connect to server. Check your network connection.",
          icon: "signal_wifi_off",
        });
      }
    }

    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // Register axios as a global property
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // Restore token from localStorage if it exists
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
});

export { api };
