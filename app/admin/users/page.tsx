"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserDataTable } from "@/components/organisms/UserDataTable";
import { UserManagementModal } from "@/components/organisms/UserManagementModal";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { AdminUser, UserListResponse } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Users, 
  UserPlus, 
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function UserManagementPage() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<AdminUser | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers(page, search, limit);
      setData(response);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, limit]);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setCurrentUserProfile(profile);
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchProfile();
  }, [fetchUsers, fetchProfile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSaveUser = async (id: string, updateData: Partial<AdminUser>) => {
    try {
      await userService.updateUser(id, updateData);
      fetchUsers(); // Refresh list
    } catch (error) {
      throw error;
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await userService.createUser(userData);
      fetchUsers(); // Refresh list
    } catch (error) {
      throw error;
    }
  };

  const handleRevokeSessions = async (id: string) => {
    try {
      await userService.revokeSessions(id);
    } catch (error) {
      throw error;
    }
  };

  const handleBlockUser = async (user: AdminUser) => {
    try {
      await userService.softDeleteUser(user.id);
      toast.success(user.isActive ? "Đã khoá tài khoản thành công!" : "Đã mở khoá tài khoản!");
      fetchUsers();
    } catch (error) {
      toast.error("Thao tác thất bại.");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý người dùng</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">
            Xem, tìm kiếm và quản lý quyền hạn của thành viên.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchUsers()} 
            className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-sm"
          >
            <RefreshCcw className={isLoading ? "w-3.5 h-3.5 mr-2 animate-spin" : "w-3.5 h-3.5 mr-2"} /> Làm mới
          </Button>
          <Button 
            className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 font-bold text-sm"
            onClick={handleAdd}
          >
            <UserPlus className="w-3.5 h-3.5 mr-2" /> Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Tìm theo tên, email hoặc số điện thoại..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 text-sm font-medium rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-none"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 px-8 rounded-xl font-bold border-none text-sm bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/10 transition-all active:scale-95">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* User Table Section */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <UserDataTable 
              users={data?.users || []} 
              onEdit={handleEdit} 
              onBlock={handleBlockUser}
              onRevokeSessions={async (u) => {
                await handleRevokeSessions(u.id);
                toast.success("Đã đăng xuất tài khoản khỏi tất cả thiết bị!");
              }}
            />

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
                        setPage(1); // Reset page to 1 when changing limit
                      }}
                      className="bg-transparent text-[13px] font-bold text-slate-700 outline-none cursor-pointer hover:text-primary transition-colors pr-1"
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
                      {Array.from({ length: Math.min(data.lastPage, 7) }, (_, i) => {
                          let p = i + 1;
                          if (data.lastPage > 7) {
                            if (page > 4 && i === 1) return <span key="dots-1" className="px-1 text-slate-300">...</span>;
                            if (page < data.lastPage - 3 && i === 5) return <span key="dots-2" className="px-1 text-slate-300">...</span>;
                            
                            if (page <= 4) {
                              if (i === 6) p = data.lastPage;
                              else p = i + 1;
                            } else if (page >= data.lastPage - 3) {
                              if (i === 0) p = 1;
                              else p = data.lastPage - 6 + i;
                            } else {
                              if (i === 0) p = 1;
                              else if (i === 6) p = data.lastPage;
                              else p = page - 3 + i;
                            }
                          }

                          return (
                            <Button
                              key={p}
                              variant={p === page ? "default" : "ghost"}
                              className={cn(
                                "h-9 w-9 rounded-lg font-bold text-[13px] transition-all",
                                p === page 
                                  ? "bg-primary text-white shadow-sm hover:bg-primary/90" 
                                  : "text-slate-500 hover:bg-slate-100"
                              )}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          );
                      })}
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

      {/* Modals */}
      <UserManagementModal 
        user={selectedUser}
        currentUserRole={currentUserProfile?.role}
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        onCreate={handleCreateUser}
        onRevokeSessions={handleRevokeSessions}
      />
    </div>
  );
}
