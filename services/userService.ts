import axiosInstance from "@/lib/axios";
import { AdminUser, UserListResponse } from "@/types/user";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count?: {
    users: number;
  };
}

export const userService = {
  getUsers: async (page: number = 1, search?: string, limit: number = 10): Promise<UserListResponse> => {
    const response = await axiosInstance.get("/users/admin/list", {
      params: { page, search, limit }
    });
    return response.data;
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await axiosInstance.get(`/users/admin/${id}`);
    return response.data.data;
  },

  updateUser: async (id: string, data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await axiosInstance.patch(`/users/admin/${id}`, data);
    return response.data.data;
  },

  softDeleteUser: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/users/admin/${id}/soft-delete`);
  },

  revokeSessions: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/users/admin/${id}/revoke-sessions`);
  },

  getPendingUsers: async (page: number = 1, search?: string, limit: number = 10): Promise<UserListResponse> => {
    const response = await axiosInstance.get("/users/admin/pending", {
      params: { page, search, limit }
    });
    return response.data;
  },

  approveUser: async (id: string): Promise<AdminUser> => {
    const response = await axiosInstance.patch(`/users/admin/${id}/approve`);
    return response.data.data;
  },

  createUser: async (data: any): Promise<AdminUser> => {
    const response = await axiosInstance.post("/users/admin/create", data);
    return response.data.data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await axiosInstance.get("/departments");
    return response.data;
  },
};
