"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userService } from "@/services/userService";
import { AdminUser } from "@/types/user";
import {
  CheckCircle2,
  MoreHorizontal,
  RefreshCw,
  Search,
  UserCheck,
  XCircle,
} from "lucide-react";

function getUserInitial(name: string) {
  return name.trim().split(" ").pop()?.charAt(0).toUpperCase() || "U";
}

function matchesSearch(user: AdminUser, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return [user.fullName, user.email, user.phone]
    .join(" ")
    .toLowerCase()
    .includes(normalizedKeyword);
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("vi-VN");
}

export function PendingUsersManagementContent() {
  const queryClient = useQueryClient();
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["pendingUsers"],
    queryFn: () => userService.getPendingUsers(1, undefined, 1000), // Get all pending
  });

  const pendingUsers = response?.users || [];

  const filteredUsers = useMemo(
    () => pendingUsers.filter((user) => matchesSearch(user, searchKeyword)),
    [pendingUsers, searchKeyword],
  );

  const approveMutation = useMutation({
    mutationFn: userService.approveUser,
    onSuccess: () => {
      toast.success("Đã phê duyệt tài khoản thành công!");
      void queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi phê duyệt");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: userService.softDeleteUser,
    onSuccess: () => {
      toast.success("Đã từ chối (khoá) tài khoản!");
      void queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Lỗi khi từ chối");
    },
  });

  const handleApprove = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn phê duyệt tài khoản này không?")) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn TỪ CHỐI tài khoản này không? (Tài khoản sẽ bị khoá)")) {
      rejectMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Thành viên chờ duyệt
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý các tài khoản đăng ký mới chưa được phê duyệt.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl px-5"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["pendingUsers"] })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-12 rounded-2xl pl-11 text-sm"
              placeholder="Tìm kiếm theo tên, email, sđt..."
            />
          </div>
          <Button type="button" className="h-12 rounded-2xl px-8 bg-orange-600 hover:bg-orange-700 text-white">
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-[320px] px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Thành viên
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Liên hệ
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Vai trò
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Trạng thái
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Ngày đăng ký
              </TableHead>
              <TableHead className="w-[80px] px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Đang tải danh sách...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Không có thành viên nào đang chờ duyệt.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group border-slate-50 transition-colors hover:bg-slate-50/50"
                >
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarFallback className="bg-orange-50 text-xs font-bold text-orange-700">
                          {getUserInitial(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold leading-tight text-slate-900 transition-colors group-hover:text-orange-700">
                          {user.fullName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          #{user.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[13px] font-semibold text-slate-700">
                        {user.email || user.phone || "---"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        ---
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="rounded-md border-transparent bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold uppercase text-slate-700"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-[12px] font-bold">Chờ phê duyệt</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span className="text-[13px] font-medium text-slate-500">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8 rounded-lg transition-all hover:text-orange-700",
                        )}
                      >
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 p-2 shadow-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Quản lý tài khoản
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={() => handleApprove(user.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(user.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
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
    </div>
  );
}
