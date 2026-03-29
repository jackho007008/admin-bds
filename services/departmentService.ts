import axiosInstance from "@/lib/axios";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count?: {
    users: number;
  };
}

export const departmentService = {
  getDepartments: async () => {
    const response = await axiosInstance.get<Department[]>("/departments");
    return response.data;
  },

  createDepartment: async (data: { name: string; description?: string }) => {
    const response = await axiosInstance.post<Department>("/departments", data);
    return response.data;
  },

  updateDepartment: async (id: string, data: { name?: string; description?: string }) => {
    const response = await axiosInstance.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: string) => {
    const response = await axiosInstance.delete(`/departments/${id}`);
    return response.data;
  },
};
