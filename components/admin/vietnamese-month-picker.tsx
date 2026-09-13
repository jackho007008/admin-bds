"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type VietnameseMonthPickerProps = {
  value: string; // MM/YYYY or YYYY-MM or "09/2026"
  onChange: (value: string) => void; // returns "MM/YYYY" (or "YYYY-MM")
  placeholder?: string;
};

export function VietnameseMonthPicker({
  value,
  onChange,
  placeholder = "Chọn tháng / năm",
}: VietnameseMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected month (1..12) and year (e.g. 2026)
  let selectedMonth: number | null = null;
  let selectedYear: number | null = null;

  if (value) {
    if (value.includes("/")) {
      const [mm, yyyy] = value.split("/");
      selectedMonth = parseInt(mm, 10) || null;
      selectedYear = parseInt(yyyy, 10) || null;
    } else if (value.includes("-")) {
      const [yyyy, mm] = value.split("-");
      selectedMonth = parseInt(mm, 10) || null;
      selectedYear = parseInt(yyyy, 10) || null;
    }
  }

  const currentActualYear = new Date().getFullYear();
  const currentActualMonth = new Date().getMonth() + 1;

  const [displayYear, setDisplayYear] = useState<number>(
    selectedYear || currentActualYear,
  );

  useEffect(() => {
    if (selectedYear) {
      setDisplayYear(selectedYear);
    }
  }, [selectedYear]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectMonth = (monthNum: number) => {
    const formattedMonth = String(monthNum).padStart(2, "0");
    const monthYearStr = `${formattedMonth}/${displayYear}`;
    onChange(monthYearStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const formattedMonth = String(currentActualMonth).padStart(2, "0");
    const monthYearStr = `${formattedMonth}/${currentActualYear}`;
    setDisplayYear(currentActualYear);
    onChange(monthYearStr);
    setIsOpen(false);
  };

  const formattedDisplayString =
    selectedMonth && selectedYear
      ? `Tháng ${String(selectedMonth).padStart(2, "0")}/${selectedYear}`
      : placeholder;

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span
          className={
            selectedMonth ? "text-slate-800 font-semibold" : "text-slate-400"
          }
        >
          {formattedDisplayString}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
          {/* Year header navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setDisplayYear(displayYear - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-base font-bold text-slate-800">
              Năm {displayYear}
            </span>

            <button
              type="button"
              onClick={() => setDisplayYear(displayYear + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2 py-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isSelected =
                selectedMonth === m && selectedYear === displayYear;
              const isCurrent =
                currentActualMonth === m && currentActualYear === displayYear;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectMonth(m)}
                  className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : isCurrent
                        ? "border border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Tháng {m}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Xóa
            </button>

            <button
              type="button"
              onClick={handleThisMonth}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Tháng hiện tại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
