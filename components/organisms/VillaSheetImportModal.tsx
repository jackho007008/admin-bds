"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CalendarRange,
  CheckCircle2,
  Grid2X2,
  Loader2,
  ScanLine,
  Sheet,
} from "lucide-react";
import {
  villaImportService,
  VillaImportSource,
  VillaImportTemplate,
  VillaImportPreviewResponse,
} from "@/services/villaImportService";

type VillaNameStrategy = "row_scan" | "column_scan" | "explicit_range";
type PriceAxisDirection = "columns_are_villas" | "rows_are_villas";

interface VillaSheetImportConfig {
  sourceName: string;
  templateName: string;
  spreadsheetUrl: string;
  sheetName: string;
  monthCell: string;
  monthFallback: string;
  villaNameStrategy: VillaNameStrategy;
  villaNameRow: string;
  villaNameColumn: string;
  villaNameRange: string;
  villaNameStartCell: string;
  villaNameEndCell: string;
  priceAxisDirection: PriceAxisDirection;
  villaAxisRange: string;
  dayAxisRange: string;
  weekdayAxisRange: string;
  priceGridRange: string;
  notes: string;
}

interface VillaSheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  customerName?: string;
  onImported?: () => void;
}

const defaultConfig: VillaSheetImportConfig = {
  sourceName: "",
  templateName: "",
  spreadsheetUrl: "",
  sheetName: "",
  monthCell: "",
  monthFallback: "",
  villaNameStrategy: "row_scan",
  villaNameRow: "",
  villaNameColumn: "",
  villaNameRange: "",
  villaNameStartCell: "",
  villaNameEndCell: "",
  priceAxisDirection: "columns_are_villas",
  villaAxisRange: "",
  dayAxisRange: "",
  weekdayAxisRange: "",
  priceGridRange: "",
  notes: "",
};

const strategyDescriptions: Record<VillaNameStrategy, string> = {
  row_scan: "Quét một hàng, ô nào có giá trị thì được hiểu là tên villa.",
  column_scan: "Quét một cột, ô nào có giá trị thì được hiểu là tên villa.",
  explicit_range: "Chỉ đọc đúng vùng dữ liệu mà bạn chọn.",
};

export function VillaSheetImportModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  onImported,
}: VillaSheetImportModalProps) {
  const [config, setConfig] = useState<VillaSheetImportConfig>(defaultConfig);
  const [sourceId, setSourceId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [previewResult, setPreviewResult] =
    useState<VillaImportPreviewResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  const updateField = <K extends keyof VillaSheetImportConfig>(
    key: K,
    value: VillaSheetImportConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setConfig(defaultConfig);
    setSourceId("");
    setTemplateId("");
    setPreviewResult(null);
  };

  const buildConfigFromSavedMapping = (
    source: VillaImportSource,
    template?: VillaImportTemplate
  ): VillaSheetImportConfig => ({
    sourceName: source.sourceName || "",
    templateName: template?.templateName || "",
    spreadsheetUrl: source.spreadsheetUrl || "",
    sheetName: source.sheetName || "",
    monthCell: source.monthCell || "",
    monthFallback: source.monthFallback || "",
    villaNameStrategy:
      template?.villaNameStrategy === "COLUMN_SCAN"
        ? "column_scan"
        : template?.villaNameStrategy === "EXPLICIT_RANGE"
          ? "explicit_range"
          : "row_scan",
    villaNameRow: template?.villaNameRow || "",
    villaNameColumn: template?.villaNameColumn || "",
    villaNameRange: template?.villaNameRange || "",
    villaNameStartCell: template?.villaNameStartCell || "",
    villaNameEndCell: template?.villaNameEndCell || "",
    priceAxisDirection:
      template?.priceAxisDirection === "ROWS_ARE_VILLAS"
        ? "rows_are_villas"
        : "columns_are_villas",
    villaAxisRange: template?.villaAxisRange || "",
    dayAxisRange: template?.dayAxisRange || "",
    weekdayAxisRange: template?.weekdayAxisRange || "",
    priceGridRange: template?.priceGridRange || "",
    notes: template?.notes || "",
  });

  useEffect(() => {
    const hydrateCustomerMapping = async () => {
      if (!isOpen || !customerId) {
        return;
      }

      setIsHydrating(true);
      try {
        const sources = await villaImportService.listSources();
        const customerSources = sources.filter(
          (source) => source.customerId === customerId
        );

        if (customerSources.length === 0) {
          resetForm();
          return;
        }

        const latestSource = customerSources[0];
        const templates = await villaImportService.listTemplates(latestSource.id);
        const latestTemplate = templates[0];

        setSourceId(latestSource.id);
        setTemplateId(latestTemplate?.id || "");
        setConfig(buildConfigFromSavedMapping(latestSource, latestTemplate));
        setPreviewResult(null);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được cấu hình đã lưu của chủ villa");
      } finally {
        setIsHydrating(false);
      }
    };

    void hydrateCustomerMapping();
  }, [customerId, isOpen]);

  const extractSpreadsheetId = (url: string) => {
    const matched = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return matched?.[1] || "";
  };

  const extractSheetGid = (url: string) => {
    const matched = url.match(/[?#&]gid=(\d+)/);
    return matched?.[1] || "";
  };

  const buildSourcePayload = () => ({
    customerId,
    sourceName: config.sourceName,
    spreadsheetId: extractSpreadsheetId(config.spreadsheetUrl),
    spreadsheetUrl: config.spreadsheetUrl,
    sheetName: config.sheetName,
    sheetGid: extractSheetGid(config.spreadsheetUrl) || undefined,
    monthCell: config.monthCell || undefined,
    monthFallback: config.monthFallback || undefined,
    isActive: true,
  });

  const buildTemplatePayload = (currentSourceId: string) => ({
    sourceId: currentSourceId,
    templateName: config.templateName,
    villaNameStrategy: config.villaNameStrategy,
    villaNameRow: config.villaNameRow || undefined,
    villaNameColumn: config.villaNameColumn || undefined,
    villaNameRange: config.villaNameRange || undefined,
    villaNameStartCell: config.villaNameStartCell || undefined,
    villaNameEndCell: config.villaNameEndCell || undefined,
    priceAxisDirection: config.priceAxisDirection,
    villaAxisRange: config.villaAxisRange,
    dayAxisRange: config.dayAxisRange,
    weekdayAxisRange: config.weekdayAxisRange || undefined,
    priceGridRange: config.priceGridRange,
    notes: config.notes || undefined,
    config: templateJson,
    isActive: true,
  });

  const saveMapping = async () => {
    if (!customerId) {
      toast.error("Chọn chủ villa trước khi cấu hình mapping");
      return null;
    }

    const spreadsheetId = extractSpreadsheetId(config.spreadsheetUrl);
    if (!spreadsheetId) {
      toast.error("Google Sheet URL chưa hợp lệ");
      return null;
    }

    setIsSaving(true);
    try {
      const sourcePayload = buildSourcePayload();
      const savedSource = sourceId
        ? await villaImportService.updateSource(sourceId, sourcePayload)
        : await villaImportService.createSource(sourcePayload);
      setSourceId(savedSource.id);

      const templatePayload = buildTemplatePayload(savedSource.id);
      const savedTemplate = templateId
        ? await villaImportService.updateTemplate(templateId, templatePayload)
        : await villaImportService.createTemplate(templatePayload);
      setTemplateId(savedTemplate.id);

      toast.success("Đã lưu source và template mapping");
      return {
        sourceId: savedSource.id,
        templateId: savedTemplate.id,
      };
    } catch (error) {
      console.error(error);
      toast.error("Lưu mapping thất bại");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportToDatabase = async () => {
    if (!customerId) {
      toast.error("Chọn chủ villa trước khi import");
      return;
    }

    const saved = await saveMapping();
    if (!saved) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await villaImportService.importConfiguredSheet({
        customerId,
        sourceId: saved.sourceId,
        templateId: saved.templateId,
        monthOverride: config.monthFallback || undefined,
      });

      toast.success(
        `Đã lưu ${result.importedVillaCount} villa và ${result.importedRateCount} dòng giá`
      );
      onImported?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Import dữ liệu vào DB thất bại");
    } finally {
      setIsImporting(false);
    }
  };

  const handlePreview = async () => {
    const saved = await saveMapping();
    if (!saved) {
      return;
    }

    setIsPreviewing(true);
    try {
      const result = await villaImportService.previewConfiguredSheet({
        sourceId: saved.sourceId,
        templateId: saved.templateId,
        monthOverride: config.monthFallback || undefined,
      });
      setPreviewResult(result);
      toast.success("Đã preview mapping thành công");
    } catch (error) {
      console.error(error);
      toast.error("Preview import thất bại");
    } finally {
      setIsPreviewing(false);
    }
  };

  const namesSummary = useMemo(() => {
    const selectedRange =
      config.villaNameRange ||
      (config.villaNameStartCell && config.villaNameEndCell
        ? `${config.villaNameStartCell}:${config.villaNameEndCell}`
        : "chưa chọn vùng");

    if (config.villaNameStrategy === "row_scan") {
      return `Quét hàng ${config.villaNameRow || "chưa chọn"}, lấy các ô có giá trị trong vùng ${selectedRange}.`;
    }

    if (config.villaNameStrategy === "column_scan") {
      return `Quét cột ${config.villaNameColumn || "chưa chọn"}, lấy các ô có giá trị trong vùng ${selectedRange}.`;
    }

    return `Đọc trực tiếp vùng ${config.villaNameRange || "chưa chọn"}.`;
  }, [config]);

  const priceSummary = useMemo(() => {
    if (config.priceAxisDirection === "columns_are_villas") {
      return `Mỗi cột là một villa. Tên villa lấy từ ${config.villaAxisRange || "chưa chọn"}, ngày lấy từ ${config.dayAxisRange || "chưa chọn"}, giá lấy từ ${config.priceGridRange || "chưa chọn"}.`;
    }

    return `Mỗi hàng là một villa. Tên villa lấy từ ${config.villaAxisRange || "chưa chọn"}, ngày lấy từ ${config.dayAxisRange || "chưa chọn"}, giá lấy từ ${config.priceGridRange || "chưa chọn"}.`;
  }, [config]);

  const templateJson = {
    sheetName: config.sheetName,
    monthCell: config.monthCell,
    monthFallback: config.monthFallback,
    villaName: {
      strategy: config.villaNameStrategy,
      row: config.villaNameRow,
      column: config.villaNameColumn,
      range: config.villaNameRange,
      startCell: config.villaNameStartCell,
      endCell: config.villaNameEndCell,
    },
    priceCalendar: {
      direction: config.priceAxisDirection,
      villaAxisRange: config.villaAxisRange,
      dayAxisRange: config.dayAxisRange,
      weekdayAxisRange: config.weekdayAxisRange,
      priceGridRange: config.priceGridRange,
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[94vh] max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-[2.5rem] border-none p-0 shadow-[0_32px_120px_-24px_rgba(15,97,45,0.35)] sm:max-w-6xl">
        <DialogHeader className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-8 py-7">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sheet className="h-3.5 w-3.5" />
                Cấu hình Google Sheet
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Chọn vị trí lấy tên villa và bảng giá theo tháng
                </DialogTitle>
                <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Đi từng bước bên dưới để chọn nguồn dữ liệu, vị trí tên villa
                  và vùng giá. Hệ thống sẽ lưu lại mapping để lần sau không bị
                  chọn nhầm ô.
                </DialogDescription>
                <div className="mt-3 text-sm font-medium text-emerald-700">
                  {customerName
                    ? `Chủ villa đang cấu hình: ${customerName}`
                    : "Chưa chọn chủ villa"}
                </div>
                {isHydrating ? (
                  <div className="mt-2 text-sm text-slate-500">
                    Đang tải lại cấu hình đã lưu...
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                Bước 1: Chọn nguồn sheet
              </Badge>
              <Badge className="rounded-full bg-lime-100 px-3 py-1 text-lime-800 hover:bg-lime-100">
                Bước 2: Chọn tên villa
              </Badge>
              <Badge className="rounded-full bg-sky-100 px-3 py-1 text-sky-800 hover:bg-sky-100">
                Bước 3: Chọn bảng giá
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="min-h-0 space-y-8 overflow-y-auto px-8 py-8">
            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Bước 1: Nguồn Google Sheet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Nhập thông tin cơ bản của file sheet để hệ thống biết đọc
                  đúng tab và đúng tháng.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sourceName">Tên nguồn</Label>
                  <Input
                    id="sourceName"
                    value={config.sourceName}
                    onChange={(e) => updateField("sourceName", e.target.value)}
                    placeholder="Đặt tên để dễ nhận biết"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateName">Tên mẫu mapping</Label>
                  <Input
                    id="templateName"
                    value={config.templateName}
                    onChange={(e) =>
                      updateField("templateName", e.target.value)
                    }
                    placeholder="Đặt tên để dễ tìm lại"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="spreadsheetUrl">Google Sheet URL</Label>
                  <Input
                    id="spreadsheetUrl"
                    value={config.spreadsheetUrl}
                    onChange={(e) =>
                      updateField("spreadsheetUrl", e.target.value)
                    }
                    placeholder="Dán link Google Sheet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheetName">Tên tab trong sheet</Label>
                  <Input
                    id="sheetName"
                    value={config.sheetName}
                    onChange={(e) => updateField("sheetName", e.target.value)}
                    placeholder="Nhập tên tab cần đọc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthCell">Ô tháng</Label>
                  <Input
                    id="monthCell"
                    value={config.monthCell}
                    onChange={(e) => updateField("monthCell", e.target.value)}
                    placeholder="Nếu có ô tháng thì nhập vào đây"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="monthFallback">Tháng dự phòng</Label>
                  <Input
                    id="monthFallback"
                    value={config.monthFallback}
                    onChange={(e) =>
                      updateField("monthFallback", e.target.value)
                    }
                    placeholder="Dùng khi sheet không có ô tháng"
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Bước 2: Vị trí tên villa
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn cách đọc danh sách villa từ sheet. Hệ thống sẽ dùng
                  thông tin này để upsert đúng villa theo ô đã chọn.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Cách lấy tên villa</Label>
                  <Select
                    value={config.villaNameStrategy}
                    onValueChange={(value) =>
                      updateField(
                        "villaNameStrategy",
                        value as VillaNameStrategy
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn cách đọc tên villa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="row_scan">
                        Quét theo một hàng
                      </SelectItem>
                      <SelectItem value="column_scan">
                        Quét theo một cột
                      </SelectItem>
                      <SelectItem value="explicit_range">
                        Đọc theo một vùng cố định
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-5 text-slate-500">
                    {strategyDescriptions[config.villaNameStrategy]}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="villaNameRow">Hàng chứa tên villa</Label>
                  <Input
                    id="villaNameRow"
                    value={config.villaNameRow}
                    onChange={(e) => updateField("villaNameRow", e.target.value)}
                    placeholder="Nhập số hàng nếu cần"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="villaNameColumn">Cột chứa tên villa</Label>
                  <Input
                    id="villaNameColumn"
                    value={config.villaNameColumn}
                    onChange={(e) =>
                      updateField("villaNameColumn", e.target.value)
                    }
                    placeholder="Nhập tên cột nếu cần"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="villaNameRange">Vùng tên villa</Label>
                  <Input
                    id="villaNameRange"
                    value={config.villaNameRange}
                    onChange={(e) =>
                      updateField("villaNameRange", e.target.value)
                    }
                    placeholder="Nhập vùng cần lấy tên villa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="villaNameStartCell">Ô bắt đầu</Label>
                  <Input
                    id="villaNameStartCell"
                    value={config.villaNameStartCell}
                    onChange={(e) =>
                      updateField("villaNameStartCell", e.target.value)
                    }
                    placeholder="Nhập ô bắt đầu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="villaNameEndCell">Ô kết thúc</Label>
                  <Input
                    id="villaNameEndCell"
                    value={config.villaNameEndCell}
                    onChange={(e) =>
                      updateField("villaNameEndCell", e.target.value)
                    }
                    placeholder="Nhập ô kết thúc"
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Bước 3: Vị trí bảng giá theo tháng
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn hướng của bảng giá, vùng tên villa, vùng ngày và toàn bộ
                  vùng giá cần đọc.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Bảng giá đang sắp xếp theo hướng nào</Label>
                  <Select
                    value={config.priceAxisDirection}
                    onValueChange={(value) =>
                      updateField(
                        "priceAxisDirection",
                        value as PriceAxisDirection
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn cách bảng giá được sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="columns_are_villas">
                        Mỗi cột là một villa, mỗi hàng là một ngày
                      </SelectItem>
                      <SelectItem value="rows_are_villas">
                        Mỗi hàng là một villa, mỗi cột là một ngày
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="villaAxisRange">Vùng tên villa trong bảng giá</Label>
                  <Input
                    id="villaAxisRange"
                    value={config.villaAxisRange}
                    onChange={(e) =>
                      updateField("villaAxisRange", e.target.value)
                    }
                    placeholder="Nhập vùng tên villa gắn với bảng giá"
                  />
                  <p className="text-xs leading-5 text-slate-500">
                    Đây là vùng tên villa dùng để ghép với giá trong bảng.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dayAxisRange">Vùng ngày</Label>
                  <Input
                    id="dayAxisRange"
                    value={config.dayAxisRange}
                    onChange={(e) => updateField("dayAxisRange", e.target.value)}
                    placeholder="Nhập vùng ngày"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekdayAxisRange">Vùng thứ trong tuần</Label>
                  <Input
                    id="weekdayAxisRange"
                    value={config.weekdayAxisRange}
                    onChange={(e) =>
                      updateField("weekdayAxisRange", e.target.value)
                    }
                    placeholder="Có thể bỏ trống nếu không dùng"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="priceGridRange">Vùng giá</Label>
                  <Input
                    id="priceGridRange"
                    value={config.priceGridRange}
                    onChange={(e) =>
                      updateField("priceGridRange", e.target.value)
                    }
                    placeholder="Nhập toàn bộ vùng giá cần đọc"
                  />
                  <p className="text-xs leading-5 text-slate-500">
                    Hệ thống sẽ đọc từng ô trong vùng này để tách giá trị và
                    thông tin liên quan.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Ghi chú
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Thêm ghi chú nếu file này có quy ước riêng để team dễ theo
                  dõi về sau.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú nội bộ</Label>
                <Textarea
                  id="notes"
                  value={config.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Nhập thông tin cần ghi nhớ cho file này"
                  className="min-h-28"
                />
              </div>
            </section>

          </div>

          <aside className="min-h-0 overflow-y-auto border-t border-slate-100 bg-slate-50/70 px-8 py-8 lg:border-t-0 lg:border-l">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Grid2X2 className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Tóm tắt cấu hình
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Đọc nhanh để chắc là mình đang chọn đúng hàng, cột và vùng.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    <ScanLine className="h-3.5 w-3.5" />
                    Tên villa
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {namesSummary}
                  </div>
                </div>

                <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    <CalendarRange className="h-3.5 w-3.5" />
                    Bảng giá theo tháng
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {priceSummary}
                  </div>
                </div>

                <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Tháng
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {config.monthCell || "Chưa chọn ô tháng"}
                    {config.monthFallback
                      ? `, dự phòng ${config.monthFallback}`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500 to-lime-500 p-5 text-white shadow-lg shadow-emerald-200/80">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Hệ thống sẽ lưu đúng vị trí đã chọn
                </div>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  Sau khi lưu, backend ghi lại các ô và vùng mapping để lần
                  import sau có thể upsert đúng villa, hạn chế nhầm dữ liệu.
                </p>
              </div>

              {previewResult ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold text-slate-900">
                    Kết quả xem trước
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Villas
                      </div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {previewResult.preview.summary.detectedVillaCount}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Days
                      </div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {previewResult.preview.summary.detectedDayCount}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Records
                      </div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {previewResult.preview.summary.extractedRecordCount}
                      </div>
                    </div>
                  </div>

                  <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                    {JSON.stringify(previewResult.preview.sampleRecords, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <DialogFooter className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-8 py-5 sm:justify-between">
          <div className="text-sm text-slate-500">
            Mapping sẽ được lưu ở backend. Nút xem trước sẽ đọc trực tiếp từ
            Google Sheet theo cấu hình bạn vừa nhập.
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="outline" onClick={resetForm}>
              Làm mới form
            </Button>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={saveMapping}
              disabled={
                isSaving ||
                isPreviewing ||
                isImporting ||
                isHydrating ||
                !customerId
              }
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Lưu mapping
            </Button>
            <Button
              onClick={handlePreview}
              disabled={isSaving || isPreviewing || isImporting || isHydrating}
            >
              {isPreviewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xem trước
            </Button>
            <Button
              onClick={handleImportToDatabase}
              disabled={
                isSaving ||
                isPreviewing ||
                isImporting ||
                isHydrating ||
                !customerId
              }
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Lưu vào DB
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
