import api from '@/lib/axios';

export interface DashboardOverview {
  totalProperties: number;
  totalActiveUsers: number;
  recentProperties: any[];
  newUsers: any[];
}

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await api.get('/dashboard/overview');
  return response.data;
};
