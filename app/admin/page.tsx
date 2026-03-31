"use client";

import { 
  Building2, 
  Users, 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/services/dashboardService";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: getDashboardOverview,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { totalProperties, totalActiveUsers, recentProperties, newUsers } = data || {
    totalProperties: 0,
    totalActiveUsers: 0,
    recentProperties: [] as any[],
    newUsers: [] as any[],
  };

  const stats = [
    { 
      label: "Tổng số Bất động sản", 
      value: totalProperties.toLocaleString(), 
      icon: Building2, 
    },
    { 
      label: "Người dùng hoạt động", 
      value: totalActiveUsers.toLocaleString(), 
      icon: Users, 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-500 mt-1">Chào mừng quay lại! Dưới đây là các số liệu thống kê mới nhất.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 text-primary rounded-lg">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Bất động sản mới đăng</h2>
          <div className="space-y-4">
            {recentProperties.map((property: { id: string | number, title: string, price: number, status: string, createdAt: string, images?: {imageUrl: string}[], user?: {fullName: string} }) => (
              <div key={property.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0].imageUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-200 rounded-md"></div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm max-w-[200px] truncate" title={property.title}>{property.title}</h4>
                    <p className="text-xs text-slate-500">Đăng bởi {property.user?.fullName || 'Ẩn danh'} • {new Date(property.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(property.price)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {property.status === 'DANG_BAN' ? 'Đang bán' : property.status === 'CONG_TY_BAN' ? 'Nhật Phát Bán' : 'Dừng bán'}
                  </p>
                </div>
              </div>
            ))}
            {recentProperties.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">Chưa có bài đăng nào</p>
            )}
          </div>
          <Link href="/admin/posts" passHref>
            <Button variant="outline" className="w-full mt-6">Xem tất cả bài đăng</Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Người dùng mới đăng ký</h2>
          <div className="space-y-6">
            {newUsers.map((user: { id: string | number, fullName: string, email: string, avatarUrl: string | null, createdAt: string }) => (
              <div key={user.id} className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-green-100 text-primary flex items-center justify-center rounded-full font-bold text-sm">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 text-sm truncate" title={user.fullName}>{user.fullName}</h4>
                  <p className="text-xs text-slate-500 truncate" title={user.email}>{user.email}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
            {newUsers.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">Chưa có người dùng nào</p>
            )}
          </div>
          <Link href="/admin/users" passHref>
            <Button variant="outline" className="w-full mt-10">Quản lý người dùng</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
