"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  ShieldAlert, 
  UserX, 
  RotateCcw,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminUser, Role } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserDataTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onBlock?: (user: AdminUser) => void;
  onRevokeSessions?: (user: AdminUser) => void;
}

const ROLE_LABELS: Record<Role, string> = {
  DAU_CHU: "Đầu chủ",
  DAU_KHACH: "Đầu khách",
  TRUONG_PHONG: "Trưởng phòng",
  GIAM_DOC_KD: "GĐ kinh doanh",
  GD_KHOI: "GĐ khối",
  ADMIN: "Quản trị viên",
};

const ROLE_COLORS: Record<Role, string> = {
  DAU_CHU: "bg-blue-100 text-blue-700 border-blue-200",
  DAU_KHACH: "bg-slate-100 text-slate-700 border-slate-200",
  TRUONG_PHONG: "bg-purple-100 text-purple-700 border-purple-200",
  GIAM_DOC_KD: "bg-orange-100 text-orange-700 border-orange-200",
  GD_KHOI: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ADMIN: "bg-red-100 text-red-700 border-red-200",
};

export function UserDataTable({ users, onEdit, onBlock, onRevokeSessions }: UserDataTableProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[280px] py-4 px-6 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Người dùng</TableHead>
            <TableHead className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Liên hệ</TableHead>
            <TableHead className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Chức vụ</TableHead>
            <TableHead className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Trạng thái</TableHead>
            <TableHead className="py-4 px-4 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Ngày tạo</TableHead>
            <TableHead className="w-[80px] py-4 px-6 text-right font-bold text-slate-500 uppercase tracking-widest text-[9px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-medium text-sm">
                Không tìm thấy người dùng nào.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors border-slate-50 group">
                <TableCell className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {user.fullName.split(" ").pop()?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors text-sm">
                        {user.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">#{user.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-3 px-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-slate-700">{user.email}</span>
                    <span className="text-[11px] font-medium text-slate-400">{user.phone || "---"}</span>
                  </div>
                </TableCell>
                
                <TableCell className="py-3 px-4">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "px-2.5 py-0.5 rounded-md font-bold text-[9px] uppercase border-transparent",
                      ROLE_COLORS[user.role]
                    )}
                  >
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </TableCell>
                
                <TableCell className="py-3 px-4">
                  {user.isActive ? (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-bold">Hoạt động</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-bold">Bị khoá</span>
                    </div>
                  )}
                </TableCell>
                
                <TableCell className="py-3 px-4">
                  <span className="text-[13px] font-medium text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </TableCell>
                
                <TableCell className="py-3 px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-lg h-8 w-8 transition-all hover:text-primary")}>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Quản lý tài khoản
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => onEdit(user)}
                          className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-primary/5 hover:text-primary transition-colors font-bold"
                        >
                          <Edit className="w-4 h-4" /> Chỉnh sửa profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        
                        <DropdownMenuItem 
                          onClick={() => onBlock?.(user)}
                          className={cn(
                            "flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer transition-colors font-bold",
                            user.isActive ? "text-red-600 hover:bg-red-50 hover:text-red-700" : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          )}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-4 h-4" /> Khoá tài khoản
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" /> Mở khoá tài khoản
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => onRevokeSessions?.(user)}
                          className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-orange-50 hover:text-orange-700 transition-colors font-bold text-orange-600"
                        >
                          <ShieldAlert className="w-4 h-4" /> Đăng xuất từ xa
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
