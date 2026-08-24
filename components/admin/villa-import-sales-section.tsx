"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import type { SalesSectionProps } from "@/components/admin/villa-import-management.types";

export function VillaImportSalesSection({
  sales,
  isLoadingSales,
  onOpenCreateSaleModal,
}: SalesSectionProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-900">Quản lý sales</h2>
        <Button type="button" className="rounded-2xl" onClick={onOpenCreateSaleModal}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo sale
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-slate-900">Sale hiện có</h3>
        <div className="mt-4 space-y-3">
          {isLoadingSales ? (
            <div className="text-sm text-slate-500">Đang tải sale...</div>
          ) : sales.length === 0 ? (
            <div className="text-sm text-slate-500">Chưa có sale nào.</div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="font-semibold text-slate-900">{sale.fullName}</div>
                <div className="mt-1 text-sm text-slate-600">{sale.email}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
