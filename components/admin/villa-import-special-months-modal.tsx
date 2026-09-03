"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { Villa } from "@/services/villaImportService";

export type SpecialMonthConfig = {
  monthYear: string;
  priceZone: string;
  startDay: number;
};

type VillaSpecialMonthsModalProps = {
  isOpen: boolean;
  villa: Villa | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (villaId: string, specialMonths: SpecialMonthConfig[]) => void;
  onClose: () => void;
};

export function VillaSpecialMonthsModal({
  isOpen,
  villa,
  isSubmitting,
  onOpenChange,
  onSave,
  onClose,
}: VillaSpecialMonthsModalProps) {
  const [specialMonths, setSpecialMonths] = useState<SpecialMonthConfig[]>([]);

  useEffect(() => {
    if (isOpen && villa) {
      const metadata = (villa.metadata as Record<string, any>) || {};
      const savedSpecialMonths = (metadata.specialMonths || []) as SpecialMonthConfig[];
      setSpecialMonths(savedSpecialMonths);
    }
  }, [isOpen, villa]);

  const handleAdd = () => {
    setSpecialMonths([
      ...specialMonths,
      { monthYear: "", priceZone: "", dateZone: "", startDay: 1 },
    ]);
  };

  const handleRemove = (index: number) => {
    const newArr = [...specialMonths];
    newArr.splice(index, 1);
    setSpecialMonths(newArr);
  };

  const handleChange = (
    index: number,
    field: keyof SpecialMonthConfig,
    value: string | number
  ) => {
    const newArr = [...specialMonths];
    newArr[index] = { ...newArr[index], [field]: value };
    setSpecialMonths(newArr);
  };

  const handleSave = () => {
    if (!villa) return;
    // Format monthYear from YYYY-MM to MM/YYYY
    const formattedSpecialMonths = specialMonths.map((sm) => {
      let monthYear = sm.monthYear;
      if (monthYear && monthYear.includes("-")) {
        const [yyyy, mm] = monthYear.split("-");
        monthYear = `${mm}/${yyyy}`;
      }
      return { ...sm, monthYear };
    });
    onSave(villa.id, formattedSpecialMonths);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Cấu hình tháng đặc biệt - {villa?.name}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            Thêm các cấu hình ngoại lệ về vùng giá cho những tháng không khớp với mẫu chung.
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {specialMonths.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Chưa có tháng đặc biệt nào được cấu hình
            </div>
          ) : (
            <div className="space-y-4">
              {specialMonths.map((item, index) => {
                // convert MM/YYYY to YYYY-MM for input type="month"
                let monthInputValue = item.monthYear;
                if (monthInputValue && monthInputValue.includes("/")) {
                  const [mm, yyyy] = monthInputValue.split("/");
                  monthInputValue = `${yyyy}-${mm}`;
                }

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tháng / Năm
                      </Label>
                      <Input
                        type="month"
                        value={monthInputValue}
                        onChange={(e) =>
                          handleChange(index, "monthYear", e.target.value)
                        }
                        className="h-11 rounded-xl bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vùng giá (VD: C8:C40)
                      </Label>
                      <Input
                        placeholder="C8:C40"
                        value={item.priceZone}
                        onChange={(e) =>
                          handleChange(index, "priceZone", e.target.value)
                        }
                        className="h-11 rounded-xl bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vùng ngày
                      </Label>
                      <Input
                        placeholder="B8:B40"
                        value={item.dateZone || ""}
                        onChange={(e) =>
                          handleChange(index, "dateZone", e.target.value)
                        }
                        className="h-11 rounded-xl bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Ngày bắt đầu
                      </Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={item.startDay}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "startDay",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-11 rounded-xl bg-white"
                      />
                    </div>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      className="h-11 w-11 shrink-0 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <Button
            onClick={handleAdd}
            variant="outline"
            className="w-full h-12 rounded-xl border-dashed border-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Thêm tháng ngoại lệ
          </Button>
        </div>

        <DialogFooter className="mt-8 gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-12 rounded-xl px-6 font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-12 rounded-xl bg-emerald-600 px-8 font-semibold hover:bg-emerald-700"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
