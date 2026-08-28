"use client";

import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/services/villaImportService";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VillaImportCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string) => void;
  onDelete?: (customerId: string) => void;
}

export function VillaImportCustomerCard({
  customer,
  isSelected,
  onSelect,
  onDelete,
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
      <div className="flex items-start justify-between">
        <div className="font-semibold text-slate-900">{customer.name}</div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-2 text-slate-400 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Bạn có chắc chắn muốn xoá sheet "${customer.name}"?`)) {
                onDelete(customer.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-2">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          Sheet
        </Badge>
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {customer.notes || "Không có ghi chú"}
      </div>
      <div className="mt-3 text-xs font-medium text-emerald-700">
        Bấm để chỉnh cấu hình sheet
      </div>
    </div>
  );
}
