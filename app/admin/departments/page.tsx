"use client";

import React, { useState, useEffect, useCallback } from "react";
import { departmentService, Department } from "@/services/departmentService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Plus, 
  Search, 
  RefreshCcw,
  Edit2,
  Trash2,
  Users2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";
import { DepartmentModal } from "@/components/organisms/DepartmentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    departmentId: string;
    departmentName: string;
  }>({
    isOpen: false,
    departmentId: "",
    departmentName: "",
  });

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch {
      toast.error("Không thể tải danh sách phòng ban.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = async (data: any) => {
    await departmentService.createDepartment(data);
    fetchDepartments();
  };

  const handleUpdate = async (id: string, data: any) => {
    await departmentService.updateDepartment(id, data);
    fetchDepartments();
  };

  const handleDelete = async () => {
    try {
      await departmentService.deleteDepartment(confirmConfig.departmentId);
      toast.success(`Đã xoá phòng ban ${confirmConfig.departmentName}`);
      fetchDepartments();
    } catch {
      toast.error("Không thể xoá phòng ban này (có thể đang có nhân viên thuộc phòng này).");
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý phòng ban</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">
            Quản lý cơ cấu phòng ban và bộ máy tổ chức của công ty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchDepartments()} 
            className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-sm"
          >
            <RefreshCcw className={isLoading ? "w-3.5 h-3.5 mr-2 animate-spin" : "w-3.5 h-3.5 mr-2"} /> Làm mới
          </Button>
          <Button 
            onClick={() => {
              setSelectedDept(null);
              setIsModalOpen(true);
            }}
            className="h-10 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 text-sm text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm phòng ban
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input 
            placeholder="Tìm theo tên hoặc mô tả phòng ban..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 text-sm font-medium rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      {/* Departments Table Section */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-8 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Phòng ban</th>
                <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Mô tả</th>
                <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Nhân sự</th>
                <th className="py-4 px-8 text-right font-bold text-slate-500 uppercase tracking-widest text-[9px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-8"><Skeleton className="h-6 w-32 rounded-lg" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-48 rounded-lg" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="py-4 px-8 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-40 text-center text-slate-400 font-medium text-sm">
                    {search ? "Không tìm thấy phòng ban nào khớp với tìm kiếm." : "Chưa có phòng ban nào được tạo."}
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-[15px]">{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-500 line-clamp-1">{dept.description || "---"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[13px] font-bold">
                        <Users2 className="w-3.5 h-3.5" />
                        {dept._count?.users || 0}
                      </div>
                    </td>
                    <td className="py-4 px-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center">
                            <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1 border-slate-100 shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedDept(dept);
                              setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 p-3 text-sm font-bold text-slate-600 rounded-xl cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Sửa thông tin
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setConfirmConfig({
                              isOpen: true,
                              departmentId: dept.id,
                              departmentName: dept.name,
                            })}
                            className="flex items-center gap-2 p-3 text-sm font-bold text-red-500 rounded-xl cursor-pointer hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Xoá phòng ban
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDept(null);
        }}
        department={selectedDept}
        onCreate={handleCreate}
        onSave={handleUpdate}
      />

      <ConfirmationDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="Xác nhận xoá phòng ban"
        description={`Bạn có chắc chắn muốn xoá phòng ban ${confirmConfig.departmentName}? Thao tác này có thể ảnh hưởng đến các nhân viên đang thuộc phòng ban này.`}
        variant="destructive"
        confirmText="Xoá phòng ban"
        isLoading={isLoading}
      />
    </div>
  );
}
