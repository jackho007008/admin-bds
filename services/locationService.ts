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
  districts?: LocationUpdate[];
  wards?: { id: number; isActive: boolean }[];
}

export const locationService = {
  getProvinces: async (): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>("/locations/admin/provinces");
    return response.data.data;
  },

  getDistricts: async (provinceId: number): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>(`/locations/admin/provinces/${provinceId}/districts`);
    return response.data.data;
  },

  getWards: async (districtId: number): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>(`/locations/admin/districts/${districtId}/wards`);
    return response.data.data;
  },

  updateLocationsBulk: async (data: BulkLocationUpdate) => {
    const response = await axiosInstance.patch("/locations/admin/bulk-status", data);
    return response.data;
  },

  getDiscoveryDistricts: async (provinceId: number) => {
    const response = await axiosInstance.get<{ data: any[] }>(`/locations/discovery/${provinceId}`);
    return response.data.data;
  },

  updateDiscoveryDistricts: async (provinceId: number, districtIds: number[]) => {
    const response = await axiosInstance.patch(`/locations/admin/discovery/${provinceId}`, { districtIds });
    return response.data;
  },
};
