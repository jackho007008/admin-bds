"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import type { SaleAccount } from "@/services/villaImportService";
import type { SalesSectionProps } from "@/components/admin/villa-import-management.types";
import {
  CheckCircle2,
  Edit,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

function getSaleInitial(name: string) {
  return name.trim().split(" ").pop()?.charAt(0).toUpperCase() || "S";
}

function matchesSaleSearch(sale: SaleAccount, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  return [sale.fullName, sale.email, sale.id, sale.role]
    .join(" ")
    .toLowerCase()
    .includes(normalizedKeyword);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

export function VillaImportSalesSection({
  sales,
  isLoadingSales,
  onOpenCreateSaleModal,
  onOpenEditSaleModal,
  onRefreshSales,
}: SalesSectionProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const filteredSales = useMemo(
    () => sales.filter((sale) => matchesSaleSearch(sale, searchKeyword)),
    [sales, searchKeyword],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Quản lý sales
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Xem, tìm kiếm và quản lý tài khoản sales.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl px-5"
            onClick={onRefreshSales}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button
            type="button"
            className="h-11 rounded-2xl px-5"
            onClick={onOpenCreateSaleModal}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm sales
          </Button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="h-12 rounded-2xl pl-11 text-sm"
              placeholder="Tìm theo tên, email hoặc mã sales..."
            />
          </div>
          <Button type="button" className="h-12 rounded-2xl px-8">
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-[320px] px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Sales
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Liên hệ
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Chức vụ
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Trạng thái
              </TableHead>
              <TableHead className="px-4 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Ngày tạo
              </TableHead>
              <TableHead className="w-[80px] px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSales ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Đang tải danh sách sales...
                </TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm font-medium text-slate-400"
                >
                  Không tìm thấy sales nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="group border-slate-50 transition-colors hover:bg-slate-50/50"
                >
                  <TableCell className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700">
                          {getSaleInitial(sale.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                          {sale.fullName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          #{sale.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[13px] font-semibold text-slate-700">
                        {sale.email}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        ---
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="rounded-md border-transparent bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700"
                    >
                      Sales
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    {sale.isActive ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-bold">Hoạt động</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-bold">Bị khoá</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <span className="text-[13px] font-medium text-slate-500">
                      {formatDate(sale.createdAt)}
                    </span>
                    {sale.expiresAt && (
                      <div className="text-[11px] font-semibold text-red-500 mt-1">
                        Hạn: {formatDate(sale.expiresAt)}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8 rounded-lg transition-all hover:text-emerald-700",
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-2xl border-slate-100 p-2 shadow-xl"
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Quản lý sales
                          </DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={() => onOpenEditSaleModal(sale)}
                          >
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa profile
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
