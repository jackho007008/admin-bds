"use client";

import { Loader2, Users, X, Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AppModalBody,
  AppModalContent,
  AppModalFooter,
  AppModalHeader,
  AppModalTitle,
} from "@/components/ui/app-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { CreateOwnerModalProps } from "@/components/admin/villa-import-management.types";
import { toast } from "sonner";
import { villaImportService } from "@/services/villaImportService";

export function VillaImportCreateOwnerModal({
  isOpen,
  customerName,
  customerNotes,
  isEditing,
  isSubmitting,
  spreadsheetUrl,
  zaloLink,
  tabMonthPatterns,
  pricePatterns,
  bookedDetectionModes,
  bookedCellColors,
  onOpenChange,
  onCustomerNameChange,
  onCustomerNotesChange,
  onSpreadsheetUrlChange,
  onZaloLinkChange,
  onTabMonthPatternsChange,
  onPricePatternsChange,
  onBookedDetectionModesChange,
  onBookedCellColorsChange,
  onSubmit,
  onClose,
}: CreateOwnerModalProps) {
  const [isFetchingColor, setIsFetchingColor] = useState(false);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

  const handleFetchColor = async () => {
    if (!spreadsheetUrl) {
      toast.error("Vui lòng nhập Link Google Sheet trước khi lấy màu");
      return;
    }

    try {
      setIsFetchingColor(true);
      const extractedSpreadsheetId =
        spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] ||
        spreadsheetUrl;
      const extractedGid = spreadsheetUrl.match(/[#&]gid=([0-9]+)/)?.[1] || "0";

      const res = await villaImportService.fetchGoogleSheetColors({
        spreadsheetId: extractedSpreadsheetId,
        gid: extractedGid,
      });

      if (res.colors && res.colors.length > 0) {
        // Lọc màu trắng (thường là màu nền mặc định #ffffff) và màu đen (#000000)
        const usefulColors = res.colors
          .filter(
            (c) =>
              c.hex.toLowerCase() !== "#ffffff" &&
              c.hex.toLowerCase() !== "#000000" &&
              c.hex.toLowerCase() !== "#fff",
          )
          .map((c) => c.hex);

        if (usefulColors.length > 0) {
          const uniqueColors = Array.from(new Set(usefulColors));
          setSuggestedColors(uniqueColors);
          toast.success(
            `Đã tìm thấy ${uniqueColors.length} màu trong file! Vui lòng chọn bên dưới.`,
          );
        } else {
          setSuggestedColors([]);
          toast.info("File không có ô nào tô màu (ngoài trắng/đen)");
        }
      } else {
        toast.info("Không tìm thấy màu nền nào trong file");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Lỗi khi lấy màu từ Google Sheet",
      );
    } finally {
      setIsFetchingColor(false);
    }
  };

  const handleAddTabPattern = () => {
    onTabMonthPatternsChange([...tabMonthPatterns, ""]);
  };

  const handleUpdateTabPattern = (index: number, value: string) => {
    const newPatterns = [...tabMonthPatterns];
    newPatterns[index] = value;
    onTabMonthPatternsChange(newPatterns);
  };

  const handleRemoveTabPattern = (index: number) => {
    const newPatterns = tabMonthPatterns.filter((_, i) => i !== index);
    if (newPatterns.length === 0) newPatterns.push("");
    onTabMonthPatternsChange(newPatterns);
  };

  const handleAddPricePattern = () => {
    onPricePatternsChange([...pricePatterns, { pattern: "", multiplier: 1 }]);
  };

  const handleUpdatePricePattern = (
    index: number,
    field: "pattern" | "multiplier",
    value: any,
  ) => {
    const newPatterns = [...pricePatterns];
    newPatterns[index] = { ...newPatterns[index], [field]: value };
    onPricePatternsChange(newPatterns);
  };

  const handleRemovePricePattern = (index: number) => {
    const newPatterns = pricePatterns.filter((_, i) => i !== index);
    onPricePatternsChange(newPatterns);
  };

  const handleAddColor = () => {
    onBookedCellColorsChange([...bookedCellColors, "#00a651"]);
  };

  const handleUpdateColor = (index: number, value: string) => {
    const newColors = [...bookedCellColors];
    newColors[index] = value;
    onBookedCellColorsChange(newColors);
  };

  const handleRemoveColor = (index: number) => {
    const newColors = bookedCellColors.filter((_, i) => i !== index);
    onBookedCellColorsChange(newColors);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AppModalContent className="sm:max-w-2xl">
        <AppModalHeader>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <Users className="h-4 w-4" />
            {isEditing ? "Cập nhật sheet" : "Tạo mới sheet"}
          </div>
          <AppModalTitle className="pt-3">
            {isEditing ? "Cập nhật sheet" : "Tạo sheet"}
          </AppModalTitle>
        </AppModalHeader>

        <AppModalBody className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Tên sheet</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                placeholder="Ví dụ: Hạnh Hạnh"
              />
            </div>

            <div className="space-y-2">
              <Label>Cấu hình tab tháng</Label>
              <div className="space-y-2">
                {tabMonthPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={pattern}
                      onChange={(e) =>
                        handleUpdateTabPattern(index, e.target.value)
                      }
                      placeholder="tháng {month}/{year}"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-10 w-10 text-slate-400 hover:text-red-500"
                      onClick={() => handleRemoveTabPattern(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTabPattern}
                    className="rounded-xl"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label>Cấu hình cấu trúc giá</Label>
              <div className="space-y-2">
                {pricePatterns && pricePatterns.length > 0 && (
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        Mẫu giá
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        Hệ số nhân
                      </span>
                    </div>
                    <div className="w-10"></div>
                  </div>
                )}
                {pricePatterns?.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        value={pattern.pattern}
                        onChange={(e) =>
                          handleUpdatePricePattern(
                            index,
                            "pattern",
                            e.target.value,
                          )
                        }
                        placeholder="Mẫu (VD: {price}tr)"
                      />
                      <Input
                        type="number"
                        value={pattern.multiplier}
                        onChange={(e) =>
                          handleUpdatePricePattern(
                            index,
                            "multiplier",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Hệ số (VD: 1000000)"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-10 w-10 text-slate-400 hover:text-red-500"
                      onClick={() => handleRemovePricePattern(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPricePattern}
                    className="rounded-xl"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spreadsheetUrl">Link Google Sheet</Label>
            <Input
              id="spreadsheetUrl"
              value={spreadsheetUrl}
              onChange={(e) => onSpreadsheetUrlChange(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Nhận biết phòng đã cho thuê
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Chọn một quy ước để bước đọc giá biết ô nào không còn trống.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cách nhận biết</Label>
                <Select
                  value={bookedDetectionModes[0] || "cell_color"}
                  onValueChange={(val) =>
                    onBookedDetectionModesChange([val as string])
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Chọn cách phát hiện chốt">
                      {bookedDetectionModes[0] === "price_note"
                        ? "Ô có note/comment"
                        : bookedDetectionModes[0] === "cell_color_or_note"
                          ? "Cả hai"
                          : "Ô có màu nền"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cell_color" label="Ô có màu nền">
                      Ô có màu nền
                    </SelectItem>
                    <SelectItem value="price_note" label="Ô có note/comment">
                      Ô có note/comment
                    </SelectItem>
                    <SelectItem value="cell_color_or_note" label="Cả hai">
                      Cả hai
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(bookedDetectionModes.includes("cell_color") ||
                bookedDetectionModes.includes("cell_color_or_note")) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Màu đã cho thuê</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFetchColor}
                        disabled={isFetchingColor}
                        className="h-6 px-2 text-xs rounded-lg"
                      >
                        {isFetchingColor ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : null}
                        Lấy màu
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddColor}
                        className="h-6 px-2 text-xs rounded-lg"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Thêm
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {bookedCellColors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2"
                      >
                        <div
                          className="h-6 w-8 shrink-0 rounded border border-slate-200"
                          style={{ backgroundColor: color }}
                        />
                        <Input
                          value={color}
                          onChange={(e) =>
                            handleUpdateColor(index, e.target.value)
                          }
                          placeholder="#00a651"
                          className="h-8 border-0 shadow-none focus-visible:ring-0 px-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-slate-400 hover:text-red-500"
                          onClick={() => handleRemoveColor(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {suggestedColors.length > 0 && (
                      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                        <p className="text-xs text-blue-600 mb-2 font-medium">
                          Màu tìm thấy trong file (Click để chọn):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedColors.map((color, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                if (!bookedCellColors.includes(color)) {
                                  onBookedCellColorsChange([
                                    ...bookedCellColors,
                                    color,
                                  ]);
                                }
                                setSuggestedColors(
                                  suggestedColors.filter((c) => c !== color),
                                );
                              }}
                              className="group relative h-8 w-8 rounded-md border border-slate-200 overflow-hidden shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                              style={{ backgroundColor: color }}
                              title={color}
                            >
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerNotes">Ghi chú</Label>
            <Textarea
              id="customerNotes"
              value={customerNotes}
              onChange={(e) => onCustomerNotesChange(e.target.value)}
              placeholder="Ghi chú để mn cùng biết"
              className="min-h-20"
            />
          </div>
        </AppModalBody>

        <AppModalFooter>
          <Button
            type="button"
            variant="ghost"
            className="rounded-2xl"
            onClick={onClose}
          >
            Đóng
          </Button>
          <Button
            type="button"
            className="rounded-2xl"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Lưu thay đổi" : "Tạo Sheet"}
          </Button>
        </AppModalFooter>
      </AppModalContent>
    </Dialog>
  );
}
