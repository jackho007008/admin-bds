"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AppModalContent,
  AppModalDescription,
  AppModalHeader,
  AppModalTitle,
} from "@/components/ui/app-modal";
import { Banknote, CalendarRange, ChevronDown, House } from "lucide-react";
import type { OwnerDetailsModalProps } from "@/components/admin/villa-import-management.types";

export function VillaImportOwnerDetailsModal({
  isOpen,
  selectedCustomerName,
  selectedCustomerId,
  detailsTab,
  isLoadingVillas,
  villas,
  isLoadingRates,
  rates,
  groupedRates,
  expandedVillaId,
  onOpenChange,
  onTabChange,
  onExpandedVillaChange,
}: OwnerDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AppModalContent className="max-h-[90vh] max-w-4xl rounded-[1.75rem]">
        <AppModalHeader className="px-6 py-5 sm:px-8">
          <AppModalTitle className="text-xl">
            {selectedCustomerName || "Chi tiết chủ villa"}
          </AppModalTitle>
          <AppModalDescription className="text-sm">
            Xem danh sách villa và dữ liệu giá đã lưu cho chủ villa này.
          </AppModalDescription>
        </AppModalHeader>

        <div className="flex gap-2 border-b border-slate-100 px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant={detailsTab === "villas" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => onTabChange("villas")}
          >
            <House className="mr-2 h-4 w-4" />
            Villa đã lưu
          </Button>
          <Button
            type="button"
            variant={detailsTab === "rates" ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => onTabChange("rates")}
          >
            <Banknote className="mr-2 h-4 w-4" />
            Dữ liệu giá
          </Button>
        </div>

        <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {detailsTab === "villas" ? (
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  Villa đã lưu cho chủ villa
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                {!selectedCustomerId ? (
                  <div className="text-sm text-slate-500">
                    Chọn chủ villa để xem danh sách villa.
                  </div>
                ) : isLoadingVillas ? (
                  <div className="text-sm text-slate-500">
                    Đang tải danh sách villa...
                  </div>
                ) : villas.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    Chủ villa này chưa có villa nào.
                  </div>
                ) : (
                  villas.map((villa) => (
                    <div
                      key={villa.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="font-semibold text-slate-900">{villa.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Ô nguồn: {villa.sourceCellRef || "N/A"} • Sheet:{" "}
                        {villa.sourceSheetName || "N/A"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  Dữ liệu giá đã lưu
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                {!selectedCustomerId ? (
                  <div className="text-sm text-slate-500">
                    Chọn chủ villa để xem dữ liệu giá theo ngày.
                  </div>
                ) : isLoadingRates ? (
                  <div className="text-sm text-slate-500">Đang tải dữ liệu giá...</div>
                ) : rates.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    Chủ villa này chưa có dữ liệu giá nào.
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Đã lưu {rates.length} dòng giá cho {groupedRates.length} villa.
                    </div>
                    {groupedRates.map((group) => {
                      const isExpanded = expandedVillaId === group.villaId;
                      const latestRate = group.rates[0];

                      return (
                        <div
                          key={group.villaId}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => onExpandedVillaChange(group.villaId)}
                            className="flex w-full items-start justify-between gap-4 p-5 text-left"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{group.villaName}</div>
                              <div className="mt-2 text-sm text-slate-600">
                                {group.monthValue ? `Tháng ${group.monthValue}` : "Chưa rõ tháng"} • {group.rates.length} ngày có dữ liệu
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Sheet: {group.sheetName} • Giá gần nhất:{" "}
                                {latestRate?.price
                                  ? latestRate.price.toLocaleString("vi-VN")
                                  : "Không có giá"}
                              </div>
                            </div>
                            <ChevronDown
                              className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isExpanded ? (
                            <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {group.rates.map((rate) => (
                                  <div
                                    key={rate.id}
                                    className="rounded-2xl border border-white bg-white p-4 shadow-sm"
                                  >
                                    <div className="font-semibold text-slate-900">
                                      {rate.stayDate || `${rate.monthValue || "N/A"} / ${rate.dayLabel}`}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">
                                      Giá:{" "}
                                      {rate.price
                                        ? rate.price.toLocaleString("vi-VN")
                                        : "Không có giá"}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-600">
                                      Raw: {rate.rawValue}
                                    </div>
                                    {rate.note ? (
                                      <div className="mt-1 text-xs text-slate-500">
                                        Ghi chú: {rate.note}
                                      </div>
                                    ) : null}
                                    <div className="mt-2 text-xs text-slate-500">
                                      Ô nguồn: {rate.sourceCellRef}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </AppModalContent>
    </Dialog>
  );
}
