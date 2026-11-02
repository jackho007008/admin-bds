import axiosInstance from "@/lib/axios";

export interface SystemSettings {
  id: string;
  maxHiddenInfoViewsPerDay: number;
  adminZalo: string | null;
  createdAt: string;
  updatedAt: string;
}

export const systemSettingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    const response = await axiosInstance.get("/system-settings");
    return response.data;
  },

  updateSettings: async (data: { adminZalo: string | null }): Promise<SystemSettings> => {
    const response = await axiosInstance.patch("/system-settings", data);
    return response.data;
  },
};
