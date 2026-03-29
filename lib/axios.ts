import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and Refresh Token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops on the refresh/login endpoints
      if (originalRequest.url.includes("/auth/refresh") || originalRequest.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Call backend refresh token endpoint
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const { access_token, user } = response.data;
        
        // Update Zustand store
        useAuthStore.getState().setAuth(user, access_token);

        // Update headers for retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Retry the original failed request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired -> Force Logout
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
