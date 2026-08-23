"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerSearchForm() {
  const [budget, setBudget] = useState("");
  const [guests, setGuests] = useState("");

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-5 md:rounded-[2rem] md:p-6">
      <div className="space-y-4 rounded-[1.25rem] border border-slate-200 p-4 sm:space-y-5 sm:rounded-[1.5rem] sm:p-5 md:p-6">
        <div className="space-y-3">
          <Label className="text-base font-medium text-slate-500 sm:text-[17px] md:text-[18px]">
            Tầm giá / đêm (đồng)
          </Label>
          <Input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="vd: 2000000"
            className="h-14 rounded-[1.25rem] border-slate-200 px-5 text-[18px] text-slate-600 placeholder:text-slate-400 sm:h-16 sm:px-6 sm:text-[20px] md:text-[24px]"
          />
        </div>

        <div className="grid gap-4 rounded-[1.25rem] border border-slate-200 p-4 sm:rounded-[1.5rem] sm:p-5 md:grid-cols-[1fr_auto_1fr] md:items-center md:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <CalendarDays className="h-8 w-8 text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10" />
            <div>
              <div className="text-base font-medium text-slate-500 sm:text-[17px] md:text-[18px]">
                Nhận
              </div>
              <div className="text-[18px] font-semibold text-slate-900 sm:text-[20px] md:text-[22px]">
                Chọn ngày
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <CalendarDays className="h-8 w-8 text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10" />
            <div>
              <div className="text-base font-medium text-slate-500 sm:text-[17px] md:text-[18px]">
                Trả
              </div>
              <div className="text-[18px] font-semibold text-slate-900 sm:text-[20px] md:text-[22px]">
                Chọn ngày
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium text-slate-500 sm:text-[17px] md:text-[18px]">
            Số khách
          </Label>
          <Input
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="vd: 10"
            className="h-14 rounded-[1.25rem] border-slate-200 px-5 text-[18px] text-slate-600 placeholder:text-slate-400 sm:h-16 sm:px-6 sm:text-[20px] md:text-[24px]"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[84px_1fr] sm:gap-4 md:grid-cols-[96px_1fr]">
          <button
            type="button"
            className="flex h-14 items-center justify-center rounded-[1.25rem] bg-slate-100 text-slate-900 sm:h-16 sm:rounded-[1.5rem] md:h-[72px]"
          >
            <SlidersHorizontal
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
              strokeWidth={2.2}
            />
          </button>
          <Button className="h-14 rounded-[1.25rem] bg-black text-[18px] font-semibold text-white hover:bg-black/90 sm:h-16 sm:rounded-[1.5rem] sm:text-[20px] md:h-[72px] md:text-[24px]">
            Tìm kiếm
          </Button>
        </div>
      </div>

      <p className="px-1 pt-8 text-base leading-7 text-slate-500 sm:pt-10 sm:text-lg sm:leading-8 md:pt-12 md:text-[20px] md:leading-9">
        Nhập ngày, hoặc mở Bộ lọc (tên/tiện ích) rồi bấm {" "}
        &#34;Tìm kiếm&#34;.
      </p>
    </div>
  );
}
