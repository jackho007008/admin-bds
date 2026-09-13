"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  Settings,
  Sheet,
  Trash2,
  X,
} from "lucide-react";
import type { OwnersSectionProps } from "@/components/admin/villa-import-management.types";

const ITEMS_PER_PAGE = 4; // User requested limit 4 sheets per page

function readMetadataText(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "";
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

export function VillaImportOwnersSection({
  customers,
  isLoadingCustomers,
  selectedCustomerId,
  onOpenCreateOwnerModal,
  onSelectCustomer,
  onDeleteCustomer,
}: OwnersSectionProps) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return customers;
    }
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        (c.notes && c.notes.toLowerCase().includes(keyword)) ||
        readMetadataText(c.metadata, "spreadsheetUrl")
          .toLowerCase()
          .includes(keyword)
    );
  }, [customers, searchKeyword]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;

  const paginatedCustomers = useMemo(() => {
    const page = Math.min(currentPage, totalPages);
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage, totalPages]);

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý sheet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Mỗi sheet đại diện cho một nguồn Google Sheet và cấu hình đọc tháng.
          </p>
        </div>
        <Button
          type="button"
          className="h-11 rounded-2xl px-5"
          onClick={onOpenCreateOwnerModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo sheet mới
        </Button>
      </div>

      <Separator />

      {/* Main Table Card Container */}
      <div className="space-y-4">
        {/* Table Search & Filter Bar */}
        <div className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Sheet hiện có</h3>
            <Badge
              variant="secondary"
              className="rounded-xl bg-emerald-50 text-emerald-700 font-semibold"
            >
              {filteredCustomers.length} sheet
            </Badge>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm theo tên sheet, ghi chú..."
              className="h-10 rounded-2xl pl-10 pr-9 text-sm border-slate-200 focus-visible:ring-emerald-500/20"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow className="border-b border-slate-100">
                <TableHead className="h-12 px-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tên Sheet / Nguồn
                </TableHead>
                <TableHead className="h-12 px-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ghi chú
                </TableHead>
                <TableHead className="h-12 px-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cấu hình
                </TableHead>
                <TableHead className="h-12 px-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingCustomers ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Đang tải danh sách sheet...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    {searchKeyword
                      ? "Không tìm thấy sheet nào phù hợp với từ khóa."
                      : "Chưa có sheet nào được tạo."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => {
                  const isSelected = selectedCustomerId === customer.id;
                  const spreadsheetUrl = readMetadataText(
                    customer.metadata,
                    "spreadsheetUrl"
                  );

                  return (
                    <TableRow
                      key={customer.id}
                      className={`group transition-colors ${
                        isSelected
                          ? "bg-emerald-50/60 hover:bg-emerald-50/80"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Name & Source */}
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 font-bold shadow-xs">
                            <Sheet className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate">
                                {customer.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 shrink-0"
                              >
                                Sheet
                              </Badge>
                            </div>
                            {spreadsheetUrl ? (
                              <a
                                href={spreadsheetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-0.5 inline-flex items-center text-xs text-slate-400 hover:text-emerald-600 truncate max-w-xs transition-colors"
                              >
                                <span className="truncate">{spreadsheetUrl}</span>
                                <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="mt-0.5 block text-xs text-slate-400">
                                Google Sheet Source
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="px-5 py-4 text-sm text-slate-600">
                        {customer.notes ? (
                          <span className="line-clamp-2">{customer.notes}</span>
                        ) : (
                          <span className="italic text-slate-400 text-xs">
                            Không có ghi chú
                          </span>
                        )}
                      </TableCell>

                      {/* Config Button */}
                      <TableCell className="px-5 py-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectCustomer(customer.id)}
                          className="h-9 rounded-xl border-emerald-200 bg-emerald-50/50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                        >
                          <Settings className="mr-1.5 h-3.5 w-3.5" />
                          Chỉnh cấu hình sheet
                        </Button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4 text-right">
                        {onDeleteCustomer && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Bạn có chắc chắn muốn xoá sheet "${customer.name}"?`
                                )
                              ) {
                                onDeleteCustomer(customer.id);
                              }
                            }}
                            title="Xóa sheet"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar (4 items per page) */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Hiển thị{" "}
              <span className="font-bold text-slate-700">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-slate-700">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredCustomers.length
                )}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-bold text-slate-700">
                {filteredCustomers.length}
              </span>{" "}
              sheet
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Trang trước
              </Button>

              <span className="px-3 text-xs font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Trang sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

