"use client";

import { useEffect, useState, useId, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AppModalContent,
  AppModalDescription,
  AppModalHeader,
  AppModalTitle,
} from "@/components/ui/app-modal";
import { locationService } from "@/services/locationService";
import { villaImportService } from "@/services/villaImportService";
import type { Villa } from "@/services/villaImportService";
import { ImageIcon, Upload, X } from "lucide-react";

type VillaCreateForm = {
  name: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  actualAddress: string;
  zaloLink: string;
  priceZone: string;
  dateZone: string;
  googleSheetUrl: string;
  tabMonthPattern: string;
  floors: string;
  bedrooms: string;
  toilets: string;
  maxGuests: string;
  description: string;
};

const initialForm: VillaCreateForm = {
  name: "",
  provinceId: "",
  districtId: "",
  wardId: "",
  actualAddress: "",
  zaloLink: "",
  priceZone: "",
  dateZone: "",
  googleSheetUrl: "",
  tabMonthPattern: "tháng {month}/{year}",
  floors: "1",
  bedrooms: "1",
  toilets: "1",
  maxGuests: "4",
  description: "",
};

type VillaCreateModalProps = {
  isOpen: boolean;
  customerId?: string;
  customerName?: string;
  villa?: Villa | null;
  onClose: () => void;
};

type ExistingVillaImage = {
  url: string;
  key: string;
};

function readConfigText(config: unknown, key: string) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return "";
  }

  const value = (config as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function readMetadataText(metadata: unknown, key: string) {
  return readConfigText(metadata, key);
}

function readMetadataObject(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

function buildExistingVillaImages(villa?: Villa | null): ExistingVillaImage[] {
  const urls = villa?.images || [];
  const keys = villa?.imageKeys?.length ? villa.imageKeys : urls;

  return urls.map((url, index) => ({
    url,
    key: keys[index] || url,
  }));
}

function buildInitialVillaForm(villa?: Villa | null): VillaCreateForm {
  if (!villa) {
    return initialForm;
  }

  return {
    name: villa.name || "",
    provinceId: villa.province?.id
      ? String(villa.province.id)
      : villa.provinceId
        ? String(villa.provinceId)
        : "",
    districtId: villa.district?.id
      ? String(villa.district.id)
      : villa.districtId
        ? String(villa.districtId)
        : "",
    wardId: villa.ward?.id
      ? String(villa.ward.id)
      : villa.wardId
        ? String(villa.wardId)
        : "",
    actualAddress:
      readMetadataText(villa.metadata, "googleMapsUrl") ||
      readMetadataText(villa.metadata, "actualAddress"),
    zaloLink: readMetadataText(villa.metadata, "zaloLink"),
    priceZone: villa.priceZone || "",
    dateZone: villa.dateZone || "",
    googleSheetUrl: villa.sourceSpreadsheetId
      ? `https://docs.google.com/spreadsheets/d/${villa.sourceSpreadsheetId}/edit`
      : "",
    tabMonthPattern:
      readMetadataText(villa.metadata, "tabMonthPattern") ||
      "tháng {month}/{year}",
    floors: villa.floors ? String(villa.floors) : "1",
    bedrooms: villa.bedrooms ? String(villa.bedrooms) : "1",
    toilets: villa.toilets ? String(villa.toilets) : "1",
    maxGuests: villa.maxGuests ? String(villa.maxGuests) : "4",
    description: villa.description || "",
  };
}

export function VillaCreateModal({
  isOpen,
  customerId,
  customerName,
  villa,
  onClose,
}: VillaCreateModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<VillaCreateForm>(() =>
    buildInitialVillaForm(villa),
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingVillaImage[]>(
    () => buildExistingVillaImages(villa),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncAllMonths, setSyncAllMonths] = useState(true);
  const isEditing = Boolean(villa);
  const reactId = useId();
  const imageInputId = `villa-images-${reactId}`;

  const [selectedImagePreviews, setSelectedImagePreviews] = useState<
    { file: File; url: string }[]
  >([]);

  useEffect(() => {
    const previews = selectedImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setSelectedImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImages]);

  const { data: provinces = [] } = useQuery({
    queryKey: ["locationsTree"],
    queryFn: locationService.getLocationsTree,
    enabled: isOpen,
  });

  const selectedProvince = provinces.find(
    (province) => String(province.id) === form.provinceId,
  );
  const districts = selectedProvince?.districts || [];
  const selectedDistrict = districts.find(
    (district) => String(district.id) === form.districtId,
  );
  const wards = selectedDistrict?.wards || [];
  const selectedWard = wards.find((ward) => String(ward.id) === form.wardId);

  const updateField = (key: keyof VillaCreateForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      provinceId: value,
      districtId: "",
      wardId: "",
    }));
  };

  const handleDistrictChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      districtId: value,
      wardId: "",
    }));
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((current) =>
      current.filter((_file, fileIndex) => fileIndex !== index),
    );
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((current) =>
      current.filter((_image, imageIndex) => imageIndex !== index),
    );
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      return Boolean(
        form.name.trim() && form.provinceId && form.districtId && form.wardId,
      );
    }

    if (step === 2) {
      return Boolean(form.priceZone.trim());
    }

    return true;
  };

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const buildMetadata = () => {
    const previousMetadata = readMetadataObject(villa?.metadata);
    const spreadsheetId =
      extractSpreadsheetId(form.googleSheetUrl) || form.googleSheetUrl.trim();

    return {
      ...previousMetadata,
      sourceSpreadsheetId: spreadsheetId,
      tabMonthPattern: form.tabMonthPattern.trim(),
      actualAddress: form.actualAddress.trim() || null,
      googleMapsUrl: form.actualAddress.trim() || null,
      zaloLink: form.zaloLink.trim() || null,
    };
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast.error("Chọn khách hàng trước khi tạo villa");
      return;
    }

    if (!validateStep(1) || !validateStep(2)) {
      toast.error("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("provinceId", form.provinceId);
      formData.append("districtId", form.districtId);
      formData.append("wardId", form.wardId);
      formData.append("priceZone", form.priceZone.trim());
      if (form.dateZone.trim())
        formData.append("dateZone", form.dateZone.trim());

      const spreadsheetId =
        extractSpreadsheetId(form.googleSheetUrl) || form.googleSheetUrl.trim();
      formData.append("sourceSpreadsheetId", spreadsheetId);

      if (form.description.trim())
        formData.append("description", form.description.trim());
      formData.append("metadata", JSON.stringify(buildMetadata()));
      if (villa) {
        formData.append(
          "existingImages",
          JSON.stringify(existingImages.map((image) => image.key)),
        );
      }
      formData.append("floors", form.floors || "1");
      formData.append("bedrooms", form.bedrooms || "1");
      formData.append("toilets", form.toilets || "1");
      formData.append("maxGuests", form.maxGuests || "4");

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      let savedVillaId = villa?.id;

      if (villa) {
        await villaImportService.updateVillaMultipart(villa.id, formData);
      } else {
        const newVilla =
          await villaImportService.createVillaForCustomerMultipart(
            customerId,
            formData,
          );
        savedVillaId = newVilla.id;
      }

      toast.success(villa ? "Đã cập nhật villa" : "Đã tạo villa cho sheet");

      if (syncAllMonths && savedVillaId) {
        villaImportService
          .importAllConfiguredMonths({
            customerId,
            villaId: savedVillaId,
          })
          .catch((err) => {
            console.error("Lỗi đồng bộ giá background:", err);
          });
      }

      void queryClient.invalidateQueries({
        queryKey: ["customerVillas", customerId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["customerRates", customerId],
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Tạo villa thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AppModalContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-[2rem] sm:max-w-5xl">
        <AppModalHeader>
          <AppModalTitle>
            {isEditing ? "Chỉnh villa" : "Tạo villa mới"}
          </AppModalTitle>
          <AppModalDescription>
            {customerName
              ? `${isEditing ? "Chỉnh villa" : "Tạo villa"} cho sheet: ${customerName}`
              : "Chọn sheet trước khi tạo villa"}
          </AppModalDescription>
        </AppModalHeader>

        <div className="border-b border-slate-100 px-8 py-4">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step <= currentStep || validateStep(currentStep)) {
                    setCurrentStep(step);
                  }
                }}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                  currentStep === step
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Bước {step}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7 [&_input[data-slot=input]]:h-11">
          {currentStep === 1 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Tên villa</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Nhập tên villa"
                />
              </div>
              <div className="space-y-2">
                <Label>Tỉnh / Thành phố</Label>
                <Select
                  value={form.provinceId}
                  onValueChange={(value) => {
                    if (value) {
                      handleProvinceChange(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full min-w-0">
                    <span
                      className={
                        selectedProvince
                          ? "truncate"
                          : "truncate text-slate-400"
                      }
                    >
                      {selectedProvince?.name || "Chọn tỉnh/thành"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={String(province.id)}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quận / Huyện</Label>
                <Select
                  value={form.districtId}
                  onValueChange={(value) => {
                    if (value) {
                      handleDistrictChange(value);
                    }
                  }}
                  disabled={!form.provinceId}
                >
                  <SelectTrigger className="h-11 w-full min-w-0">
                    <span
                      className={
                        selectedDistrict
                          ? "truncate"
                          : "truncate text-slate-400"
                      }
                    >
                      {selectedDistrict?.name || "Chọn quận/huyện"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={String(district.id)}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phường / Xã</Label>
                <Select
                  value={form.wardId}
                  onValueChange={(value) => {
                    if (value) {
                      updateField("wardId", value);
                    }
                  }}
                  disabled={!form.districtId}
                >
                  <SelectTrigger className="h-11 w-full min-w-0">
                    <span
                      className={
                        selectedWard ? "truncate" : "truncate text-slate-400"
                      }
                    >
                      {selectedWard?.name || "Chọn phường/xã"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={String(ward.id)}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Link Google Maps</Label>
                <Input
                  value={form.actualAddress}
                  onChange={(e) => updateField("actualAddress", e.target.value)}
                  placeholder="Dán link Google Maps"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Link Zalo</Label>
                <Input
                  value={form.zaloLink}
                  onChange={(e) => updateField("zaloLink", e.target.value)}
                  placeholder="Dán link Zalo nếu có"
                />
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Vùng giá (Bắt buộc) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.priceZone}
                    onChange={(e) => updateField("priceZone", e.target.value)}
                    placeholder="VD: C6:C36"
                    className="bg-slate-50 transition-colors focus:bg-white"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Vùng ngày (Tuỳ chọn)
                  </Label>
                  <Input
                    value={form.dateZone}
                    onChange={(e) => updateField("dateZone", e.target.value)}
                    placeholder="VD: B6:B36"
                    className="bg-slate-50 transition-colors focus:bg-white"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Số phòng ngủ</Label>
                <Input
                  value={form.bedrooms}
                  onChange={(e) => updateField("bedrooms", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Số toilet</Label>
                <Input
                  value={form.toilets}
                  onChange={(e) => updateField("toilets", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Số khách tối đa</Label>
                <Input
                  value={form.maxGuests}
                  onChange={(e) => updateField("maxGuests", e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-32"
                />
              </div>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label>Ảnh villa</Label>
                <input
                  id={imageInputId}
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onClick={(e) => {
                    // Cho phép chọn lại cùng 1 file
                    e.currentTarget.value = "";
                  }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setSelectedImages((current) => [...current, ...files]);
                    }
                  }}
                />
                <label
                  htmlFor={imageInputId}
                  className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-6 py-8 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="mt-4 text-sm font-bold text-slate-900">
                    Chọn ảnh villa
                  </span>
                  <span className="mt-1 text-xs font-medium text-slate-500">
                    Có thể chọn nhiều ảnh cùng lúc
                  </span>
                </label>
              </div>

              {selectedImagePreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-slate-900">
                    Đã chọn {selectedImagePreviews.length} ảnh
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedImagePreviews.map((preview, index) => (
                      <div
                        key={`${preview.file.name}-${preview.file.size}-${index}`}
                        className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview.url}
                            alt={preview.file.name}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white hover:text-red-600"
                            onClick={() => removeSelectedImage(index)}
                            aria-label={`Xoá ảnh ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2">
                          <ImageIcon className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="truncate text-xs font-medium text-slate-600">
                            {preview.file.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
                  Chưa chọn ảnh mới.
                </div>
              )}

              {isEditing && existingImages.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-900">
                      Ảnh đang có
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {existingImages.length} ảnh
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {existingImages.map((image, index) => (
                      <div
                        key={`${image.key}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={`Ảnh villa ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white hover:text-red-600"
                            onClick={() => removeExistingImage(index)}
                            aria-label={`Xoá ảnh đang có ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-8 py-5 sm:flex-row sm:justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
            >
              Quay lại
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => {
                  if (!validateStep(currentStep)) {
                    toast.error(
                      "Vui lòng nhập đủ thông tin bắt buộc trước khi sang bước tiếp",
                    );
                    return;
                  }
                  setCurrentStep((prev) => Math.min(prev + 1, 4));
                }}
              >
                Tiếp tục
              </Button>
            ) : (
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center space-x-2 mr-1">
                  <input
                    type="checkbox"
                    id="syncAllMonths"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={syncAllMonths}
                    onChange={(e) => setSyncAllMonths(e.target.checked)}
                  />
                  <Label
                    htmlFor="syncAllMonths"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Đồng bộ bảng giá từ tất cả các tháng
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEditing
                      ? "Đang lưu..."
                      : "Đang tạo..."
                    : isEditing
                      ? "Lưu villa"
                      : "Tạo villa"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </AppModalContent>
    </Dialog>
  );
}
