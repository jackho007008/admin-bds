import axiosInstance from "../lib/axios";

export interface Tag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await axiosInstance.get<Tag[]>("/tags");
    return response.data;
  },

  createTag: async (name: string): Promise<Tag> => {
    const response = await axiosInstance.post<Tag>("/tags", { name });
    return response.data;
  },

  updateTag: async (id: string, name: string): Promise<Tag> => {
    const response = await axiosInstance.patch<Tag>(`/tags/${id}`, { name });
    return response.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tags/${id}`);
  },
};
