"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { VillaImportCustomerCard } from "@/components/admin/villa-import-customer-card";
import type { OwnersSectionProps } from "@/components/admin/villa-import-management.types";

export function VillaImportOwnersSection({
  customers,
  isLoadingCustomers,
  selectedCustomerId,
  onOpenCreateOwnerModal,
  onSelectCustomer,
  onDeleteCustomer,
}: OwnersSectionProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý sheet</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Mỗi sheet đại diện cho một nguồn Google Sheet và cấu hình đọc tháng.
          </p>
        </div>
        <Button type="button" className="rounded-2xl" onClick={onOpenCreateOwnerModal}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo sheet
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="text-base font-semibold text-slate-900">Sheet hiện có</h3>
        <div className="mt-4 space-y-3">
          {isLoadingCustomers ? (
            <div className="text-sm text-slate-500">Đang tải sheet...</div>
          ) : customers.length === 0 ? (
            <div className="text-sm text-slate-500">Chưa có sheet nào.</div>
          ) : (
            customers.map((customer) => (
              <VillaImportCustomerCard
                key={customer.id}
                customer={customer}
                isSelected={selectedCustomerId === customer.id}
                onSelect={onSelectCustomer}
                onDelete={onDeleteCustomer}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
