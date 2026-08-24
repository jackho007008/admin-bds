"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote, House, KeyRound, Sheet } from "lucide-react";
import type { Customer } from "@/services/villaImportService";
import type { DetailsTab } from "@/components/admin/villa-import-management.types";

interface VillaImportCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string) => void;
  onOpenSheetConfig: (customerId: string) => void;
  onOpenAccount: (customerId: string) => void;
  onOpenDetails: (customerId: string, tab: DetailsTab) => void;
}

export function VillaImportCustomerCard({
  customer,
  isSelected,
  onSelect,
  onOpenSheetConfig,
  onOpenAccount,
  onOpenDetails,
}: VillaImportCustomerCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(customer.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(customer.id);
        }
      }}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
        isSelected
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="font-semibold text-slate-900">{customer.name}</div>
      <div className="mt-2">
        <Badge
          variant="secondary"
          className={
            customer.accountUser
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }
        >
          {customer.accountUser ? customer.accountUser.email : "Chưa có tài khoản"}
        </Badge>
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {customer.notes || "Không có ghi chú"}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          className="rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSheetConfig(customer.id);
          }}
          aria-label="Mở modal cài đặt"
        >
          <Sheet className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl px-3 sm:px-4"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAccount(customer.id);
          }}
          aria-label={customer.accountUser ? "Reset mật khẩu" : "Thiết lập tài khoản"}
        >
          <KeyRound className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {customer.accountUser ? "Reset mật khẩu" : "Thiết lập tài khoản"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl px-3 sm:px-4"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(customer.id, "villas");
          }}
          aria-label="Xem villa"
        >
          <House className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Xem villa</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl px-3 sm:px-4"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(customer.id, "rates");
          }}
          aria-label="Xem giá"
        >
          <Banknote className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Xem giá</span>
        </Button>
      </div>
    </div>
  );
}
