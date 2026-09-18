"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  FileSpreadsheet,
  X,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Calendar,
  DollarSign,
  Link2,
  Palette,
  Check,
} from "lucide-react";
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
import { villaImportService } from "@/services/villaImportService";
import type { CreateOwnerModalProps } from "@/components/admin/villa-import-management.types";

export function VillaImportCreateOwnerModal({
  isOpen,
  customerName,
  customerNotes,
  isEditing,
  isSubmitting,
  spreadsheetUrl,
  tabMonthPatterns,
  pricePatterns,
  bookedDetectionModes,
  bookedCellColors = [],
  onOpenChange,
  onCustomerNameChange,
  onCustomerNotesChange,
  onSpreadsheetUrlChange,
  onTabMonthPatternsChange,
  onPricePatternsChange,
  onBookedDetectionModesChange,
  onBookedCellColorsChange,
  onSubmit,
  onClose,
}: CreateOwnerModalProps) {
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

  const formatNumberDots = (val?: number | string) => {
    if (val === undefined || val === null || val === "") return "";
    const num =
      typeof val === "number"
        ? val
        : Number(String(val).replace(/\./g, "").replace(/[^\d]/g, ""));
    if (isNaN(num) || num === 0) return "";
    return num.toLocaleString("vi-VN");
  };

  const parseNumberDots = (val: string): number | undefined => {
    const clean = val.replace(/\./g, "").replace(/[^\d]/g, "");
    return clean ? Number(clean) : undefined;
  };

  const handleAddPricePattern = () => {
    onPricePatternsChange([
      ...pricePatterns,
      { pattern: "", multiplier: 1000000 },
    ]);
  };

  const handleUpdatePricePattern = (
    index: number,
    field: "pattern" | "multiplier" | "multiplier2",
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

  const [isFetchingColors, setIsFetchingColors] = useState(false);
  const [detectedColors, setDetectedColors] = useState<
    Array<{ hex: string; count: number }>
  >([]);

  const extractSpreadsheetId = (url: string) => {
    const matched = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return matched?.[1] || url.trim();
  };

  const extractSheetGid = (url: string) => {
    const matched = url.match(/[?#&]gid=(\d+)/);
    return matched?.[1] || "0";
  };

  const handleFetchColors = async () => {
    if (!spreadsheetUrl?.trim()) {
      toast.warning("Vui lòng nhập Link Google Sheet trước khi lấy màu");
      return;
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    const gid = extractSheetGid(spreadsheetUrl);

    if (!spreadsheetId) {
      toast.error("Link Google Sheet không hợp lệ");
      return;
    }

    try {
      setIsFetchingColors(true);
      const result = await villaImportService.fetchGoogleSheetColors({
        spreadsheetId,
        gid,
      });

      if (result?.colors && result.colors.length > 0) {
        const bgColors = result.colors
          .filter(
            (c) =>
              c.kinds.includes("background") &&
              c.hex.toLowerCase() !== "#ffffff",
          )
          .map((c) => ({
            hex: c.hex.toLowerCase(),
            count: c.count,
          }));

        if (bgColors.length > 0) {
          setDetectedColors(bgColors);
          toast.success(
            `Đã quét được ${bgColors.length} màu nền trên Sheet. Hãy bấm vào màu bên dưới để chọn!`,
          );
        } else {
          setDetectedColors([]);
          toast.info("Không tìm thấy màu nền nào khác màu trắng trên Sheet");
        }
      } else {
        setDetectedColors([]);
        toast.info("Không phát hiện màu nền nào trên Google Sheet này");
      }
    } catch (error: any) {
      console.error("Failed to fetch sheet colors", error);
      toast.error(
        "Không thể lấy màu từ Google Sheet. Vui lòng kiểm tra lại link hoặc quyền truy cập.",
      );
    } finally {
      setIsFetchingColors(false);
    }
  };

  const toggleDetectedColor = (hex: string) => {
    const cleanHex = hex.toLowerCase().trim();
    const current = (bookedCellColors || []).map((c) => c.toLowerCase().trim());
    if (current.includes(cleanHex)) {
      const updated = (bookedCellColors || []).filter(
        (c) => c.toLowerCase().trim() !== cleanHex,
      );
      onBookedCellColorsChange(updated);
    } else {
      onBookedCellColorsChange([...(bookedCellColors || []), cleanHex]);
    }
  };

  const handleAddBookedColor = () => {
    onBookedCellColorsChange([...(bookedCellColors || []), "#"]);
  };

  const handleUpdateBookedColor = (index: number, value: string) => {
    const newColors = [...(bookedCellColors || [])];
    newColors[index] = value;
    onBookedCellColorsChange(newColors);
  };

  const handleRemoveBookedColor = (index: number) => {
    const newColors = (bookedCellColors || []).filter((_, i) => i !== index);
    onBookedCellColorsChange(newColors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AppModalContent className="sm:max-w-2xl border border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <AppModalHeader className="bg-slate-50/80 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {isEditing ? "Cấu hình Google Sheet" : "Tạo mới kết nối Sheet"}
            </span>
          </div>
          <AppModalTitle className="pt-2 text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {isEditing ? "Cập nhật sheet" : "Tạo sheet mới"}
          </AppModalTitle>
          <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
            Thiết lập thông tin định dạng và quy tắc tự động đồng bộ dữ liệu từ
            Google Sheet
          </p>
        </AppModalHeader>

        {/* Form Body */}
        <AppModalBody className="space-y-6 px-6 py-6 max-h-[72vh] overflow-y-auto">
          {/* Card 1: Thông tin cơ bản */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="customerName"
                  className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                  Tên sheet
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                  placeholder="Ví dụ: Hub Villa"
                  className="bg-white rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Cấu hình tab tháng
                </Label>
                <div className="space-y-2">
                  {tabMonthPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={pattern}
                        onChange={(e) =>
                          handleUpdateTabPattern(index, e.target.value)
                        }
                        placeholder="tháng {month}/{year}"
                        className="bg-white rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm text-slate-800 placeholder:text-slate-400"
                      />
                      {tabMonthPatterns.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          onClick={() => handleRemoveTabPattern(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTabPattern}
                      className="rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Thêm mẫu tab
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Google Sheet */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60">
              <Label
                htmlFor="spreadsheetUrl"
                className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
              >
                <Link2 className="h-4 w-4 text-slate-500" />
                Link Google Sheet
              </Label>
              <Input
                id="spreadsheetUrl"
                value={spreadsheetUrl}
                onChange={(e) => onSpreadsheetUrlChange(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="bg-white rounded-xl border-slate-200 focus-visible:ring-emerald-500 text-sm text-slate-800 font-normal placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Card 2: Cấu hình cấu trúc giá */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-slate-500" />
                Cấu hình cấu trúc giá
              </Label>
            </div>

            <div className="space-y-2">
              {pricePatterns && pricePatterns.length > 0 && (
                <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-xs font-medium text-slate-500">
                  <div className="col-span-5">Mẫu giá trong ô</div>
                  <div className="col-span-3">
                    Hệ số phần nguyên {"{price}"}
                  </div>
                  <div className="col-span-3">Hệ số phần lẻ {"{price2}"}</div>
                  <div className="col-span-1"></div>
                </div>
              )}

              {pricePatterns?.map((pattern, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-2 flex-1">
                    <div className="md:col-span-5">
                      <Input
                        value={pattern.pattern}
                        onChange={(e) =>
                          handleUpdatePricePattern(
                            index,
                            "pattern",
                            e.target.value,
                          )
                        }
                        placeholder="VD: {price}cheo{price2}"
                        className="bg-white rounded-xl border-slate-200 text-sm text-slate-800 focus-visible:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        type="text"
                        value={formatNumberDots(pattern.multiplier)}
                        onChange={(e) =>
                          handleUpdatePricePattern(
                            index,
                            "multiplier",
                            parseNumberDots(e.target.value) || 0,
                          )
                        }
                        placeholder="VD: 1.000.000"
                        className="bg-white rounded-xl border-slate-200 text-sm text-slate-800 focus-visible:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        type="text"
                        value={formatNumberDots(pattern.multiplier2)}
                        onChange={(e) =>
                          handleUpdatePricePattern(
                            index,
                            "multiplier2",
                            parseNumberDots(e.target.value),
                          )
                        }
                        placeholder="VD: 100.000"
                        className="bg-white rounded-xl border-slate-200 text-sm text-slate-800 focus-visible:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  {pricePatterns.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      onClick={() => handleRemovePricePattern(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-900 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  Hướng dẫn cấu trúc giá:
                </div>
                <p>
                  Sử dụng biến{" "}
                  <span className="font-semibold text-amber-950">
                    {"{price}"}
                  </span>{" "}
                  (phần nguyên) và{" "}
                  <span className="font-semibold text-amber-950">
                    {"{price2}"}
                  </span>{" "}
                  (phần lẻ). Ví dụ: với mẫu{" "}
                  <span className="font-semibold text-amber-950">
                    {"{price}cheo{price2}"}
                  </span>
                  , ô ghi{" "}
                  <span className="font-semibold text-amber-950">4cheo5</span>{" "}
                  sẽ tính thành{" "}
                  <span className="font-bold text-amber-950">4.500.000đ</span>{" "}
                  (4 x 1.000.000 + 5 x 100.000).
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPricePattern}
                  className="rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Thêm mẫu giá
                </Button>
              </div>
            </div>
          </div>

          {/* Card 3: Nhận biết phòng đã cho thuê */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-3">
            <div>
              <Label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Nhận biết phòng đã cho thuê (Đã book)
              </Label>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Chọn phương thức tự động phát hiện ô/ngày đã có khách đặt cọc
                hoặc giữ chỗ trên file Google Sheet.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-medium text-slate-700">
                Cách phát hiện ngày đã book
              </Label>
              <Select
                value={bookedDetectionModes[0] || "cell_color"}
                onValueChange={(val) =>
                  onBookedDetectionModesChange([val as string])
                }
              >
                <SelectTrigger className="bg-white rounded-xl border-slate-200 h-10 text-sm text-slate-800 focus:ring-emerald-500">
                  <SelectValue placeholder="Chọn cách phát hiện chốt">
                    {bookedDetectionModes[0] === "price_note"
                      ? "Ô có ghi chú hoặc có chữ"
                      : bookedDetectionModes[0] === "cell_color"
                        ? "Ô có tô màu nền (Khác màu trắng)"
                        : "Cả hai (Màu nền tô màu hoặc có ghi chú/chữ)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem
                    value="cell_color_or_note"
                    label="Cả hai (Màu nền tô màu hoặc có ghi chú)"
                  >
                    Cả hai (Màu nền tô màu hoặc có ghi chú/chữ)
                  </SelectItem>
                  <SelectItem
                    value="cell_color"
                    label="Ô có tô màu nền (Khác màu trắng)"
                  >
                    Ô có tô màu nền (Khác màu trắng)
                  </SelectItem>
                  <SelectItem
                    value="price_note"
                    label="Ô có ghi chú hoặc có chữ"
                  >
                    Ô có ghi chú hoặc có chữ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cấu hình màu nền nếu dùng phát hiện theo màu */}
            {(bookedDetectionModes.includes("cell_color") ||
              bookedDetectionModes.includes("cell_color_or_note") ||
              bookedDetectionModes.length === 0) && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-slate-500" />
                    Màu nền đánh dấu đã đặt phòng (Tùy chọn)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFetchColors}
                      disabled={isFetchingColors}
                      className="rounded-xl border-emerald-200 bg-emerald-50/60 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 h-8"
                    >
                      {isFetchingColors ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin text-emerald-600" />
                          Đang quét...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 h-3 w-3 text-emerald-600" />
                          Lấy màu từ Sheet
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBookedColor}
                      className="rounded-xl border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-8"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Thêm màu
                    </Button>
                  </div>
                </div>

                {detectedColors.length > 0 ? (
                  <div className="space-y-2 p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        Màu nền phát hiện trên Sheet ({detectedColors.length}):
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Bấm vào màu để thêm/bớt
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {detectedColors.map((item) => {
                        const isSelected = (bookedCellColors || [])
                          .map((c) => c.toLowerCase().trim())
                          .includes(item.hex.toLowerCase().trim());
                        return (
                          <button
                            key={item.hex}
                            type="button"
                            onClick={() => toggleDetectedColor(item.hex)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-100/80 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-slate-300 shrink-0 shadow-inner"
                              style={{ backgroundColor: item.hex }}
                            />
                            <span>{item.hex}</span>
                            <span className="text-[10px] text-slate-500">
                              ({item.count} ô)
                            </span>
                            {isSelected ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600 ml-0.5 shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {bookedCellColors && bookedCellColors.length > 0 ? (
                  <div className="space-y-2">
                    {bookedCellColors.map((color, index) => {
                      const trimmed = color.trim();
                      const isValidHex =
                        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(trimmed);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="h-9 w-9 rounded-xl border border-slate-200 shrink-0 shadow-sm"
                            style={{
                              backgroundColor: isValidHex ? trimmed : "#ffffff",
                            }}
                          />
                          <Input
                            value={color}
                            onChange={(e) =>
                              handleUpdateBookedColor(index, e.target.value)
                            }
                            placeholder="Mã màu HEX (vd: #ff0000)"
                            className="bg-white rounded-xl border-slate-200 text-sm text-slate-800 font-mono focus-visible:ring-emerald-500 placeholder:text-slate-400"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            onClick={() => handleRemoveBookedColor(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div className="rounded-xl bg-slate-100/70 border border-slate-200/80 p-3 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <span className="font-semibold text-slate-800">Lưu ý:</span>{" "}
                    Hệ thống chỉ kiểm tra{" "}
                    <span className="font-semibold text-slate-800">
                      màu nền (background)
                    </span>{" "}
                    của ô (bỏ qua màu chữ). Nếu để trống danh sách màu, hệ thống
                    sẽ tự động coi tất cả các ô có{" "}
                    <span className="font-semibold text-slate-800">
                      màu nền khác màu trắng
                    </span>{" "}
                    là đã book.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Ghi chú */}
          <div className="space-y-2">
            <Label
              htmlFor="customerNotes"
              className="text-sm font-semibold text-slate-800"
            >
              Ghi chú thêm
            </Label>
            <Textarea
              id="customerNotes"
              value={customerNotes}
              onChange={(e) => onCustomerNotesChange(e.target.value)}
              placeholder="Nhập ghi chú nội bộ để quản trị viên cùng theo dõi..."
              className="min-h-[80px] bg-white rounded-xl border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-emerald-500"
            />
          </div>
        </AppModalBody>

        {/* Footer */}
        <AppModalFooter className="bg-slate-50/80 border-t border-slate-100 px-6 pt-4 pb-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-sm font-medium px-5 h-10"
            onClick={onClose}
          >
            Đóng
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-600/20 px-6 h-10"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isEditing ? "Lưu thay đổi" : "Tạo Sheet mới"}
              </>
            )}
          </Button>
        </AppModalFooter>
      </AppModalContent>
    </Dialog>
  );
}
