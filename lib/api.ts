import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const localApi = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;

export function setToken(token: string | null) {
  accessToken = token;
  for (const client of [api, localApi]) {
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common.Authorization;
    }
  };
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || "");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout")
    ) {
      throw error;
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    try {
      isRefreshing = true;
      const refreshResponse = await api.post("/auth/refresh", {});
      const newToken = refreshResponse.data?.accessToken || null;
      setToken(newToken);
      pendingQueue.forEach((cb) => cb(newToken));
      pendingQueue = [];
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setToken(null);
      pendingQueue.forEach((cb) => cb(null));
      pendingQueue = [];
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  },
);

export const authApi = {
  register: (payload: { username: string; email: string; password: string; role: string }) => localApi.post("/api/auth/register", payload),
  login: (payload: { username: string; password: string }) => localApi.post("/api/auth/login", payload),
  refresh: () => localApi.post("/api/auth/refresh", {}),
  logout: () => localApi.post("/api/auth/logout", {}),
  me: () => localApi.get("/api/auth/me"),
  verifyEmail: (token: string) => localApi.post("/api/auth/verify-email", { token }),
  dashboard: async () => {
    const response = await localApi.get("/api/auth/me");
    const role = String(response.data?.user?.role || "");
    return {
      data: {
        walletBalance: role === "CLIENT" ? 100 : role === "FREELANCER" ? 50 : 0,
      },
    };
  },
};

export const jobsApi = {
  list: (params: { search?: string; difficulty?: string }) => api.get("/jobs", { params }),
  apply: (jobId: string, message: string) => api.post("/applications", { jobId, message }),
  create: (payload: {
    title: string;
    description: string;
    difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    skillsRequired: string;
    budget: number;
    isPremium: boolean;
    premiumApplyCost: number;
  }) => api.post("/jobs", payload),
};

export default api;
