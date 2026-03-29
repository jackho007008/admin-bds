export type Role =
  | 'DAU_CHU'
  | 'DAU_KHACH'
  | 'TRUONG_PHONG'
  | 'GIAM_DOC_KD'
  | 'GD_KHOI'
  | 'ADMIN';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  zalo: string | null;
  facebookLink: string | null;
  address: string | null;
  gender: string | null;
  dob: string | null;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
  department?: {
    id: string;
    name: string;
  };
  province?: { name: string };
  district?: { name: string };
  ward?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  lastPage: number;
}
