import axiosInstance from "@/lib/axios";

export interface LocationItem {
  id: number;
  name: string;
  isActive: boolean;
}

export interface LocationUpdate {
  id: number;
  isActive: boolean;
  cascade?: boolean;
}

export interface BulkLocationUpdate {
  provinces?: LocationUpdate[];
  wards?: { id: number; isActive: boolean }[];
}

export const locationService = {
  getProvinces: async (): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>("/locations/admin/provinces");
    return response.data.data;
  },

  getWardsByProvince: async (provinceId: number): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>(`/locations/admin/provinces/${provinceId}/wards`);
    return response.data.data;
  },

  updateLocationsBulk: async (data: BulkLocationUpdate) => {
    const response = await axiosInstance.patch("/locations/admin/bulk-status", data);
    return response.data;
  },

  getDiscoveryWards: async (provinceId: number) => {
    const response = await axiosInstance.get<{ data: any[] }>(`/locations/discovery/${provinceId}`);
    return response.data.data;
  },

  updateDiscoveryWards: async (provinceId: number, wardIds: number[]) => {
    const response = await axiosInstance.patch(`/locations/admin/discovery/${provinceId}`, { wardIds });
    return response.data;
  },
};
