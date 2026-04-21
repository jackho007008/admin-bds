import axiosInstance from "@/lib/axios";

export interface LocationItem {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export interface LocationUpdate {
  code: string;
  isActive: boolean;
  cascade?: boolean;
}

export interface BulkLocationUpdate {
  provinces?: LocationUpdate[];
  wards?: { code: string; isActive: boolean }[];
}

export const locationService = {
  getProvinces: async (): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>("/api/v2/locations/admin/provinces");
    return response.data.data;
  },

  getWardsByProvince: async (provinceCode: string): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>(`/api/v2/locations/admin/provinces/${provinceCode}/wards`);
    return response.data.data;
  },

  updateLocationsBulk: async (data: BulkLocationUpdate) => {
    const response = await axiosInstance.patch("/api/v2/locations/admin/bulk-status", data);
    return response.data;
  },

  getDiscoveryWards: async (provinceCode: string) => {
    const response = await axiosInstance.get<{ data: any[] }>(`/api/v2/locations/discovery/${provinceCode}`);
    return response.data.data;
  },

  updateDiscoveryWards: async (provinceCode: string, wardIds: number[]) => {
    const response = await axiosInstance.patch(`/api/v2/locations/admin/discovery/${provinceCode}`, { wardIds });
    return response.data;
  },
};
