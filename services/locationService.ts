import axiosInstance from "@/lib/axios";

export interface LocationItem {
  id: number;
  code?: string;
  name: string;
  isActive: boolean;
}

export interface LocationTreeItem {
  id: number;
  code?: string;
  name: string;
  isActive?: boolean;
  districts?: LocationTreeItem[];
  wards?: LocationTreeItem[];
}

export interface LocationUpdate {
  id: number;
  isActive: boolean;
  cascade?: boolean;
}

export interface BulkLocationUpdate {
  provinces?: LocationUpdate[];
  districts?: { id: number; isActive: boolean; cascade?: boolean }[];
  wards?: { id: number; isActive: boolean }[];
}

export const locationService = {
  getProvinces: async (): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>("/locations/admin/provinces");
    return response.data.data;
  },

  getLocationsTree: async (): Promise<LocationTreeItem[]> => {
    const response = await axiosInstance.get<LocationTreeItem[]>("/locations/tree");
    return response.data;
  },

  getDistrictsByProvince: async (provinceId: number): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>(
      `/locations/admin/provinces/${provinceId}/districts`,
    );
    return response.data.data;
  },

  getWardsByDistrict: async (districtId: number): Promise<LocationItem[]> => {
    const response = await axiosInstance.get<{ data: LocationItem[] }>(
      `/locations/admin/districts/${districtId}/wards`,
    );
    return response.data.data;
  },

  getWardsByProvince: async (provinceCode?: string): Promise<LocationItem[]> => {
    if (!provinceCode) {
      return [];
    }

    const response = await axiosInstance.get<{ data: LocationItem[] }>(
      `/api/v2/locations/admin/provinces/${provinceCode}/wards`,
    );
    return response.data.data;
  },

  updateLocationsBulk: async (data: BulkLocationUpdate) => {
    const response = await axiosInstance.patch("/locations/admin/bulk-status", data);
    return response.data;
  },

  getDiscoveryWards: async (provinceCode: string) => {
    const response = await axiosInstance.get<{ data: Array<{ wardId: number }> }>(`/api/v2/locations/discovery/${provinceCode}`);
    return response.data.data;
  },

  updateDiscoveryWards: async (provinceCode: string, wardIds: number[]) => {
    const response = await axiosInstance.patch(`/api/v2/locations/admin/discovery/${provinceCode}`, { wardIds });
    return response.data;
  },
};
