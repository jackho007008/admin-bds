import axiosInstance from "@/lib/axios";
import { Property } from "@/types/property";

export const propertyService = {
  getProperties: async (page: number = 1, limit: number = 5): Promise<{ data: Property[], totalCount: number }> => {
    const response = await axiosInstance.get("/properties/search", {
      params: { page, limit }
    });
    return {
      data: response.data.data,
      totalCount: response.data.totalCount
    };
  },
  
  getPropertyById: async (id: string): Promise<Property> => {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data.data;
  },

  deleteProperty: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/properties/${id}`);
  },
};
