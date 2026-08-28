"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { villaImportService } from "@/services/villaImportService";
import { Villa, VillaDailyRate } from "@/services/villaImportService";
import { cn } from "@/lib/utils";

interface VillaPriceCalendarModalProps {
  villa: Villa | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VillaPriceCalendarModal({
  villa,
  isOpen,
  onClose,
}: VillaPriceCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: rates, isLoading } = useQuery({
    queryKey: ["villaRates", villa?.id],
    queryFn: () => (villa ? villaImportService.listVillaRates(villa.id) : []),
    enabled: !!villa && isOpen,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const daysInCalendar = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getRateForDay = (day: Date) => {
    if (!rates || !Array.isArray(rates)) return null;
    return rates.find((rate) => {
      if (!rate.stayDate) return false;
      // Handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss.sssZ" reliably
      // by comparing the YYYY-MM-DD portion directly
      const rateDateStr = typeof rate.stayDate === 'string' 
        ? rate.stayDate.split('T')[0] 
        : new Date(rate.stayDate).toISOString().split('T')[0];
      const targetDateStr = format(day, "yyyy-MM-dd");
      
      return rateDateStr === targetDateStr || isSameDay(new Date(rate.stayDate), day);
    });
  };

  const formatPrice = (price?: number | null, rawValue?: string | null) => {
    if (price != null && !isNaN(price)) {
      return new Intl.NumberFormat("vi-VN").format(price);
    }
    return rawValue || "-";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] xl:max-w-6xl 2xl:max-w-7xl w-full p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200/60 rounded-[2rem] shadow-2xl">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Lịch giá - {villa?.name}
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Bảng giá theo ngày được đồng bộ từ Google Sheet
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
            {/* Calendar Header Controls */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 capitalize">
                {format(currentDate, dateFormat, { locale: vi })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/50">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Đang tải lịch giá...</p>
                </div>
              )}
              
              <div className="grid grid-cols-7 bg-slate-200 gap-[1px]">
                {daysInCalendar.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const rate = getRateForDay(day);
                  const hasError = rate?.parseStatus === "ERROR";

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[100px] bg-white p-2 transition-colors",
                        !isCurrentMonth && "bg-slate-50 text-slate-400",
                        isToday && "bg-indigo-50/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                            isToday ? "bg-indigo-600 text-white" : isCurrentMonth ? "text-slate-700" : "text-slate-400"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      
                      {rate && rate.price != null && (
                        <div className={cn(
                          "mt-1 p-1.5 rounded-lg border text-xs font-medium flex flex-col gap-1",
                          hasError 
                            ? "bg-red-50 border-red-200 text-red-700" 
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        )}>
                          <span className="truncate" title={rate.rawValue || ""}>
                            {formatPrice(rate.price, rate.rawValue)}
                          </span>
                          
                          {rate.guestName && (
                            <span className="truncate text-[10px] text-slate-500 font-normal" title={rate.guestName}>
                              Khách: {rate.guestName}
                            </span>
                          )}
                          {rate.note && (
                            <span className="truncate text-[10px] text-amber-600 font-normal" title={rate.note}>
                              {rate.note}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} className="rounded-xl px-6">
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
