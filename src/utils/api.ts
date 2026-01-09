import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
});

let authFailed = false;

export const markAuthFailed = () => {
  authFailed = true;
};

const isRefreshRequest = (url?: string) =>
  url?.includes("/users/refresh-token");

export const isAuthFailed = () => authFailed;

export const hasAccessToken = () =>
  Boolean(localStorage.getItem("tapo_accessToken"));

/**
 * onTokenRefreshed
 * Notifies all pending subscribers with the newly obtained access token.
 */
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
const onTokenRefreshed = (newAccessToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

/**
 * Request Interceptor
 * - If token is missing on protected routes, attempts refresh before sending.
 * - Allows unauthenticated calls on public/registration routes.
 * - Queues concurrent requests while a refresh is in progress.
 */
api.interceptors.request.use(
  (config) => {
    if (isAuthFailed()) {
      const isPublic =
        config.url?.includes("/users/register") ||
        config.url?.includes("/users/send-otp") ||
        config.url?.includes("/users/verify-otp") ||
        config.url?.includes("/users/login");

      if (!isPublic) {
        return Promise.reject(new axios.Cancel("Auth failed, request blocked"));
      }
    }

    const accessToken = localStorage.getItem("tapo_accessToken");

    // Public endpoints (explicit)
    const isPublic =
      config.url?.includes("/users/register") ||
      config.url?.includes("/users/send-otp") ||
      config.url?.includes("/users/verify-otp") ||
      config.url?.includes("/users/login") ||
      config.url?.includes("/users/refresh-token") ||
      config.url?.includes("https://api.cloudinary.com/v1_1/") ||
      config.url?.includes("/upload/sign");

    if (!accessToken) {
      if (isPublic) return config;
      return Promise.reject(
        new axios.Cancel("No access token, request blocked")
      );
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * - Handles 401 by attempting refresh-token once and replaying the request.
 * - Queues subscribers while refresh is in progress.
 */

const notifySubscribers = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthFailed()
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/users/refresh-token`,
        {},
        { withCredentials: true }
      );

      localStorage.setItem("tapo_accessToken", data.accessToken);
      notifySubscribers(data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (err) {
      if (isRefreshRequest(originalRequest?.url)) {
        markAuthFailed();
        localStorage.removeItem("tapo_accessToken");
        location.href = "/";
      }

      return Promise.reject(err);
    }
  }
);

export default api;
