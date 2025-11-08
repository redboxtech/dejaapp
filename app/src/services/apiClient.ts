import axios from "axios";

import { apiConfig } from "@config/api";
import { authConfig } from "@config/security/authConfig";
import { useAuthStore } from "@store/index";

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout
});

apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw error;
        }

        const refreshed = await useAuthStore.getState().refreshSession();
        if (refreshed) {
          const token = useAuthStore.getState().token;
          error.config.headers.Authorization = `Bearer ${token}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        await useAuthStore.getState().signOut();
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, authConfig };

