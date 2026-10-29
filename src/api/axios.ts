import axios, { type InternalAxiosRequestConfig } from "axios";
import { handleMockRequest } from "./mockService";

const remoteUrl =
  import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL || "";
const hasRemoteServer = Boolean(remoteUrl && !remoteUrl.includes("localhost"));

const api = axios.create({
  baseURL: hasRemoteServer ? remoteUrl : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Direct mock adapter when running in standalone mode without an active remote backend
if (!hasRemoteServer) {
  api.defaults.adapter = async (config) => {
    return handleMockRequest(config);
  };
} else {
  // If remote server configured but offline/network error, fallback to mock
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        try {
          return await handleMockRequest(error.config || {});
        } catch (mockError) {
          return Promise.reject(mockError);
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;