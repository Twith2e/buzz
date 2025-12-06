import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api/v1",
  withCredentials: true,
});

/**
 * onTokenRefreshed
 * Notifies all pending subscribers with the newly obtained access token.
 */
let isRefreshing = false;
let refreshSubscribers = [];
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
    const accessToken = localStorage.getItem("tapo_accessToken");
    const pathname = window.location.pathname;

    // Public routes where unauthenticated requests are allowed.
    const publicPrefixes = ["/", "/signup", "/otp", "/complete-registration"];
    const isPublicRoute = publicPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );

    // Token missing: allow public routes; otherwise try refreshing.
    if (!accessToken) {
      if (isPublicRoute) {
        return config;
      }

      // Try refresh proactively when on protected routes.
      if (!isRefreshing) {
        isRefreshing = true;
        return axios
          .post(
            "https://tapo-server.onrender.com/api/v1/users/refresh-token",
            {},
            { withCredentials: true }
          )
          .then(({ data }) => {
            localStorage.setItem("tapo_accessToken", data.accessToken);
            onTokenRefreshed(data.accessToken);
            config.headers["Authorization"] = `Bearer ${data.accessToken}`;
            return config;
          })
          .catch(() => {
            return Promise.reject(
              new Error("No access token; refresh failed.")
            );
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // If refresh is already in progress, wait for it and then continue.
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          config.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(config);
        });
      });
    }

    // Token present: attach and proceed.
    config.headers["Authorization"] = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * - Handles 401 by attempting refresh-token once and replaying the request.
 * - Queues subscribers while refresh is in progress.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const { data } = await axios.post(
            "https://tapo-server.onrender.com/api/v1/users/refresh-token",
            {},
            { withCredentials: true }
          );
          localStorage.setItem("tapo_accessToken", data.accessToken);
          onTokenRefreshed(data.accessToken);
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        refreshSubscribers.push((newToken: string) => {
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
