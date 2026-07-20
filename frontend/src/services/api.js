import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

let isRefreshing = false;
let failedQueue = [];

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Resolve/reject all queued requests
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * REQUEST INTERCEPTOR
 * Attach JWT Access Token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Automatically refresh expired access tokens
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // If refresh endpoint itself fails,
    // don't try refreshing again
    if (originalRequest.url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      /**
       * Another refresh request is already running.
       * Wait until it finishes.
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization =
            "Bearer " + token;

          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const refreshToken =
          localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Refresh token missing");
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {
            refreshToken,
          }
        );

        const tokens = response.data.data;

        // Save new tokens
        localStorage.setItem(
          "accessToken",
          tokens.accessToken
        );

        if (tokens.refreshToken) {
          localStorage.setItem(
            "refreshToken",
            tokens.refreshToken
          );
        }

        // Retry queued requests
        processQueue(null, tokens.accessToken);

        // Retry original request
        originalRequest.headers.Authorization =
          "Bearer " + tokens.accessToken;

        return api(originalRequest);

      } catch (err) {

        processQueue(err, null);

        // Logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;