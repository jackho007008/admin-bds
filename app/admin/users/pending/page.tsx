"use client";

import React, { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/userService";
import { AdminUser, UserListResponse } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  UserCheck, 
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";

export default function PendingUsersPage() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const fetchPendingUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getPendingUsers(page, search, limit);
      setData(response);
    } catch {
      toast.error("Không thể tải danh sách chờ duyệt.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (user: AdminUser) => {
    setConfirmConfig({
      isOpen: true,
      title: "Phê duyệt nhân viên",
      description: `Bạn có chắc muốn phê duyệt tài khoản cho ${user.fullName}?`,
      onConfirm: async () => {
        try {
          await userService.approveUser(user.id);
          toast.success("Phê duyệt tài khoản thành công!");
          fetchPendingUsers();
        } catch {
          toast.error("Không thể phê duyệt tài khoản.");
        }
      }
    });
  };

  const handleReject = async (user: AdminUser) => {
    setConfirmConfig({
      isOpen: true,
      title: "Từ chối nhân viên",
      description: `Bạn có chắc muốn từ chối yêu cầu tham gia của ${user.fullName}?`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          // Assume there's a reject API or use a general update
          await userService.updateUser(user.id, { isActive: false } as any);
          toast.success("Đã từ chối yêu cầu.");
          fetchPendingUsers();
        } catch {
          toast.error("Không thể thực hiện thao tác.");
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Phê duyệt nhân viên</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">
            Danh sách nhân viên mới đăng ký chờ phê duyệt.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={() => fetchPendingUsers()} 
          className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-sm"
        >
          <RefreshCcw className={isLoading ? "w-3.5 h-3.5 mr-2 animate-spin" : "w-3.5 h-3.5 mr-2"} /> Làm mới
        </Button>
      </div>

      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchPendingUsers(); }} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Tìm theo tên hoặc email của nhân viên..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 text-sm font-medium rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-none"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 text-sm text-white">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Pending Table Section */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="rounded-[1.5rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-8 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Nhân viên</th>
                    <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Email / SĐT</th>
                    <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Ngày đăng ký</th>
                    <th className="py-4 px-8 text-right font-bold text-slate-500 uppercase tracking-widest text-[9px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="h-32 text-center text-slate-400 font-medium text-sm">
                        Không có yêu cầu chờ duyệt nào.
                      </td>
                    </tr>
                  ) : (
                    data?.users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-8 font-bold text-slate-900 text-sm">{user.fullName}</td>
                        <td className="py-4 px-4 font-medium text-slate-600">
                          <div className="text-[13px]">{user.email}</div>
                          <div className="text-[11px] text-slate-400">{user.phone || "---"}</div>
                        </td>
                        <td className="py-4 px-4 text-[13px] text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-4 px-8 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              className="h-8 px-3 rounded-lg border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-200 text-xs"
                              onClick={() => handleApprove(user)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Duyệt
                            </Button>
                            <Button 
                              variant="outline" 
                              className="h-8 px-3 rounded-lg border-red-100 text-red-500 font-bold hover:bg-red-50 hover:border-red-200 text-xs"
                              onClick={() => handleReject(user)}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Từ chối
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination block */}
            {data && (
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <p className="text-[13px] font-bold text-slate-400 whitespace-nowrap">
                      Hiển thị <span className="text-slate-900">{data.users.length}</span> / <span className="text-slate-900">{data.total}</span>
                    </p>
                    
                    {/* Limit Selector */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Số dòng:</span>
                      <select 
                        value={limit}
                        onChange={(e) => {
                          setLimit(parseInt(e.target.value));
                          setPage(1); 
                        }}
                        className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer hover:text-emerald-600 transition-colors pr-1"
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      disabled={page === 1} 
                      onClick={() => setPage(page - 1)} 
                      className={cn(
                        "h-9 w-9 rounded-lg border-slate-200 transition-all",
                        page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 text-slate-600 shadow-sm"
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {data.lastPage > 1 && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: data.lastPage }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={i + 1 === page ? "default" : "ghost"}
                            className={cn(
                              "h-9 w-9 rounded-lg font-bold text-[13px]",
                              i + 1 === page ? "bg-emerald-600 text-white" : "text-slate-500"
                            )}
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="icon" 
                      disabled={page >= data.lastPage} 
                      onClick={() => setPage(page + 1)} 
                      className={cn(
                        "h-9 w-9 rounded-lg border-slate-200 transition-all",
                        page >= data.lastPage ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 text-slate-600 shadow-sm"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
               </div>
            )}
          </>
        )}
      </div>
      <ConfirmationDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        isLoading={isLoading}
      />
    </div>
  );
}
