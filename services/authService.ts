import axiosInstance from "@/lib/axios";

export const authService = {
  login: async (email: string, pass: string) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password: pass,
    });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  refresh: async () => {
    const response = await axiosInstance.post("/auth/refresh");
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  },
};
