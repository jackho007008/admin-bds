"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Property, PropertyType, PropertyStatus, LegalStatus, InteriorStatus, PropertyImage } from "@/types/property";
import { toast } from "sonner";
import { Loader2, Save, X, ImagePlus, Trash2, Camera, FileText, ImageIcon } from "lucide-react";
import { locationService, LocationItem } from "@/services/locationService";
import { tagService, Tag } from "@/services/tagService";
import { Badge } from "@/components/ui/badge";

const propertySchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().default(0),
  type: z.string().default("MAT_PHO"),
  status: z.string().default("DANG_BAN"),
  addressRaw: z.string().default(""),
  addressOnPaper: z.string().default(""),
  otherAddress: z.string().default(""),
  actualArea: z.coerce.number().default(0),
  paperArea: z.coerce.number().default(0),
  frontageWidth: z.coerce.number().default(0),
  roadWidth: z.coerce.number().default(0),
  floors: z.coerce.number().default(0),
  bedrooms: z.coerce.number().default(0),
  toilets: z.coerce.number().default(0),
  legalStatus: z.string().default("CHUA_XAC_DINH"),
  legalNote: z.string().default(""),
  interiorStatus: z.string().default("CHUA_XAC_DINH"),
  interiorNote: z.string().default(""),
  tags: z.string().default(""),
  provinceId: z.coerce.number().nullable().default(null),
  districtId: z.coerce.number().nullable().default(null),
  wardId: z.coerce.number().nullable().default(null),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyEditModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Property>) => Promise<Property>;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "MAT_PHO", label: "Mặt phố" },
  { value: "BIET_THU", label: "Biệt thự" },
  { value: "CHUNG_CU", label: "Chung cư" },
  { value: "CHUNG_CU_MINI", label: "Chung cư mini" },
  { value: "DAT_NEN", label: "Đất nền" },
  { value: "NHA_RIENG", label: "Nhà riêng" },
  { value: "VAN_PHONG", label: "Văn phòng" },
  { value: "KHACH_SAN", label: "Khách sạn" },
  { value: "KHAC", label: "Khác" },
];

const propertyStatuses: { value: PropertyStatus; label: string }[] = [
  { value: "DANG_BAN", label: "Đang bán" },
  { value: "DUNG_BAN", label: "Dừng bán" },
  { value: "CHU_BAN", label: "Chủ bán" },
  { value: "CONG_TY_BAN", label: "Công ty bán" },
];

const legalStatuses: { value: LegalStatus; label: string }[] = [
  { value: "SO_HONG", label: "Sổ hồng" },
  { value: "SO_DO", label: "Sổ đỏ" },
  { value: "GIAY_TAY", label: "Giấy tay" },
  { value: "DANG_CHO_SO", label: "Đang chờ sổ" },
  { value: "CHUA_XAC_DINH", label: "Chưa xác định" },
];

const interiorStatuses: { value: InteriorStatus; label: string }[] = [
  { value: "DAY_DU", label: "Đầy đủ" },
  { value: "CO_BAN", label: "Cơ bản" },
  { value: "NHA_THO", label: "Nhà thô" },
  { value: "CHUA_XAC_DINH", label: "Chưa xác định" },
];

export function PropertyEditModal({ property, isOpen, onClose, onSave }: PropertyEditModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Image Management States
  const [currentImages, setCurrentImages] = React.useState<PropertyImage[]>([]);
  const [newImages, setNewImages] = React.useState<{ file: File; preview: string }[]>([]);
  const [newCertificateImages, setNewCertificateImages] = React.useState<{ file: File; preview: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      type: "MAT_PHO",
      status: "DANG_BAN",
      addressRaw: "",
      addressOnPaper: "",
      otherAddress: "",
      actualArea: 0,
      paperArea: 0,
      frontageWidth: 0,
      roadWidth: 0,
      floors: 0,
      bedrooms: 0,
      toilets: 0,
      legalNote: "",
      interiorNote: "",
      tags: "",
      provinceId: null,
      districtId: null,
      wardId: null,
    },
  });
  
  const watchedPrice = watch("price");

  const formatDisplayPrice = (p: number | undefined | null) => {
    if (p === undefined || p === null || p === 0) return "Thỏa thuận";
    const actualPrice = p * 1_000_000;
    if (actualPrice >= 1_000_000_000) {
      return `${(actualPrice / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
    }
    return `${actualPrice.toLocaleString('vi-VN')} triệu`;
  };

  const [provinces, setProvinces] = React.useState<LocationItem[]>([]);
  const [districts, setDistricts] = React.useState<LocationItem[]>([]);
  const [wards, setWards] = React.useState<LocationItem[]>([]);
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Fetch provinces error:", error);
      }
    };
    fetchProvinces();

    const fetchTags = async () => {
      try {
        const data = await tagService.getTags();
        setAvailableTags(data);
      } catch (error) {
        console.error("Fetch tags error:", error);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (property && isOpen) {
      reset({
        title: property.title,
        description: property.description || "",
        price: property.price ? property.price / 1_000_000 : 0,
        type: property.type,
        status: property.status,
        addressRaw: property.addressRaw,
        addressOnPaper: property.addressOnPaper || "",
        otherAddress: property.otherAddress || "",
        actualArea: property.actualArea || 0,
        paperArea: property.paperArea || 0,
        frontageWidth: property.frontageWidth || 0,
        roadWidth: property.roadWidth || 0,
        floors: property.floors || 0,
        bedrooms: property.bedrooms || 0,
        toilets: property.toilets || 0,
        legalStatus: property.legalStatus || "CHUA_XAC_DINH",
        legalNote: property.legalNote || "",
        interiorStatus: property.interiorStatus || "CHUA_XAC_DINH",
        interiorNote: property.interiorNote || "",
        tags: property.tags?.join(", ") || "",
        provinceId: property.provinceId || null,
        districtId: property.districtId || null,
        wardId: property.wardId || null,
      });

      // Fetch initial districts/wards if IDs exist
      if (property.provinceId) {
        locationService.getDistricts(property.provinceId).then(setDistricts);
      }
      if (property.districtId) {
        locationService.getWards(property.districtId).then(setWards);
      }

      // Reset image states
      setCurrentImages(property.images || []);
      setNewImages([]);
      setNewCertificateImages([]);
      setDeletedImageIds([]);
    }
  }, [property, isOpen, reset]);

  const onSubmit = async (values: PropertyFormValues) => {
    if (!property) return;
    
    setIsSubmitting(true);
    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      
      // Text fields
      formData.append("title", values.title || "");
      formData.append("description", values.description || "");
      formData.append("price", values.price?.toString() || "0");
      formData.append("propertyType", values.type);
      formData.append("status", values.status);
      formData.append("actualAddress", values.addressRaw);
      formData.append("paperAddress", values.addressOnPaper);
      formData.append("otherAddress", values.otherAddress);
      formData.append("actualArea", values.actualArea?.toString() || "0");
      formData.append("paperArea", values.paperArea?.toString() || "0");
      formData.append("frontage", values.frontageWidth?.toString() || "0");
      formData.append("streetWidth", values.roadWidth?.toString() || "0");
      formData.append("floors", values.floors?.toString() || "0");
      formData.append("bedrooms", values.bedrooms?.toString() || "0");
      formData.append("bathrooms", values.toilets?.toString() || "0");
      formData.append("legalStatus", values.legalStatus || "CHUA_XAC_DINH");
      formData.append("legalNote", values.legalNote || "");
      formData.append("interiorStatus", values.interiorStatus || "CHUA_XAC_DINH");
      formData.append("interiorNote", values.interiorNote || "");
      
      if (values.provinceId) formData.append("provinceId", values.provinceId.toString());
      if (values.districtId) formData.append("districtId", values.districtId.toString());
      if (values.wardId) formData.append("wardId", values.wardId.toString());

      // Tags
      const tagsArray = values.tags ? values.tags.split(",").map(t => t.trim()).filter(t => t) : [];
      formData.append("tags", JSON.stringify(tagsArray));

      // Image Management
      if (deletedImageIds.length > 0) {
        formData.append("deletedImageIds", JSON.stringify(deletedImageIds));
      }

      // New files
      newImages.forEach((img) => {
        formData.append("images", img.file);
      });

      newCertificateImages.forEach((img) => {
        formData.append("certificateImages", img.file);
      });

      await onSave(property.id, formData as any);
      toast.success("Cập nhật thông tin và hình ảnh thành công!");
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-w-[calc(100%-2rem)] max-h-[95vh] p-0 overflow-hidden flex flex-col rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Chỉnh sửa thông tin bất động sản
            </DialogTitle>
          </div>
        </DialogHeader>

        <form 
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error("Validation Errors:", errors);
            toast.error("Vui lòng kiểm tra lại thông tin. Một số trường chưa hợp lệ.");
          })} 
          className="flex flex-col flex-1 overflow-hidden"
        >
          <ScrollArea className="flex-1">
            <div className="p-8 pt-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="flex w-full max-w-3xl bg-slate-100 p-1 rounded-2xl mb-8">
                  <TabsTrigger 
                    value="basic" 
                    className="flex-1 py-3 text-sm font-bold rounded-xl data-active:bg-white data-active:text-primary data-active:shadow-sm transition-all"
                  >
                    Cơ bản
                  </TabsTrigger>
                  <TabsTrigger 
                    value="location" 
                    className="flex-1 py-3 text-sm font-bold rounded-xl data-active:bg-white data-active:text-primary data-active:shadow-sm transition-all"
                  >
                    Vị trí
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details" 
                    className="flex-1 py-3 text-sm font-bold rounded-xl data-active:bg-white data-active:text-primary data-active:shadow-sm transition-all"
                  >
                    Chi tiết
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content" 
                    className="flex-1 py-3 text-sm font-bold rounded-xl data-active:bg-white data-active:text-primary data-active:shadow-sm transition-all"
                  >
                    Nội dung
                  </TabsTrigger>
                  <TabsTrigger 
                    value="images" 
                    className="flex-1 py-3 text-sm font-bold rounded-xl data-active:bg-white data-active:text-primary data-active:shadow-sm transition-all"
                  >
                    Hình ảnh
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 focus-visible:outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tiêu đề bài đăng</Label>
                      <Input placeholder="Nhập tiêu đề thu hút..." className="py-6 text-base font-medium rounded-xl border-slate-200 h-14" {...register("title")} />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Giá bán (VND)</Label>
                      <Input 
                        type="number" 
                        placeholder="Ví dụ: 1500 cho 1.5 tỷ hoặc 1 cho 1 triệu" 
                        className="py-6 text-base font-medium rounded-xl border-slate-200 h-14" 
                        {...register("price", { valueAsNumber: true })} 
                      />
                      <p className="text-xs text-slate-400 px-1 font-medium">
                        Đơn vị: Triệu VNĐ (Ví dụ: 1000 = 1 tỷ)
                      </p>
                      <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-xs text-slate-500">Giá sẽ hiển thị: <span className="font-bold text-primary text-sm">{formatDisplayPrice(watchedPrice)}</span></p>
                      </div>
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loại bất động sản</Label>
                      <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} items={propertyTypes}>
                            <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                              <SelectValue placeholder="Chọn loại bds" />
                            </SelectTrigger>
                            <SelectContent>
                              {propertyTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Trạng thái tin đăng</Label>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} items={propertyStatuses}>
                            <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              {propertyStatuses.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-6 focus-visible:outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Vị trí thực tế / Địa chỉ</Label>
                      <Input placeholder="Số nhà, tên đường..." className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" {...register("addressRaw")} />
                      {errors.addressRaw && <p className="text-red-500 text-xs mt-1">{errors.addressRaw.message}</p>}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Địa chỉ trên sổ (Pháp lý)</Label>
                      <Input placeholder="Ghi đúng như trên sổ hồng/đỏ..." className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" {...register("addressOnPaper")} />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Địa chỉ khác / Ghi chú vị trí</Label>
                      <Input placeholder="Ngõ, hẻm, đặc điểm nhận dạng..." className="py-6 h-14 text-base font-medium rounded-xl border-slate-200" {...register("otherAddress")} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 col-span-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tỉnh / Thành phố</Label>
                        <Controller
                          control={control}
                          name="provinceId"
                          render={({ field }) => (
                            <Select 
                              onValueChange={(val) => {
                                const id = Number(val);
                                field.onChange(id);
                                // Reset child selects
                                setValue("districtId", null);
                                setValue("wardId", null);
                                setDistricts([]);
                                setWards([]);
                                if (id) locationService.getDistricts(id).then(setDistricts);
                              }} 
                              value={field.value?.toString() || ""}
                              items={provinces.map(p => ({ value: p.id.toString(), label: p.name }))}
                            >
                              <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                                <SelectValue placeholder="Chọn Tỉnh/Thành" />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces.map(p => (
                                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Quận / Huyện</Label>
                        <Controller
                          control={control}
                          name="districtId"
                          render={({ field }) => (
                            <Select 
                              disabled={!districts.length}
                              onValueChange={(val) => {
                                const id = Number(val);
                                field.onChange(id);
                                // Reset child select
                                setValue("wardId", null);
                                setWards([]);
                                if (id) locationService.getWards(id).then(setWards);
                              }} 
                              value={field.value?.toString() || ""}
                              items={districts.map(d => ({ value: d.id.toString(), label: d.name }))}
                            >
                              <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                                <SelectValue placeholder="Chọn Quận/Huyện" />
                              </SelectTrigger>
                              <SelectContent>
                                {districts.map(d => (
                                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Phường / Xã</Label>
                        <Controller
                          control={control}
                          name="wardId"
                          render={({ field }) => (
                            <Select 
                              disabled={!wards.length}
                              onValueChange={(val) => field.onChange(Number(val))} 
                              value={field.value?.toString() || ""}
                              items={wards.map(w => ({ value: w.id.toString(), label: w.name }))}
                            >
                              <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl border-slate-200">
                                <SelectValue placeholder="Chọn Phường/Xã" />
                              </SelectTrigger>
                              <SelectContent>
                                {wards.map(w => (
                                  <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-8 focus-visible:outline-none">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">DT Thực tế (m²)</Label>
                      <Input type="number" step="0.1" className="py-6 h-14 text-base font-medium rounded-xl" {...register("actualArea", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">DT Sổ (m²)</Label>
                      <Input type="number" step="0.1" className="py-6 h-14 text-base font-medium rounded-xl" {...register("paperArea", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mặt tiền (m)</Label>
                      <Input type="number" step="0.1" className="py-6 h-14 text-base font-medium rounded-xl" {...register("frontageWidth", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đường vào (m)</Label>
                      <Input type="number" step="0.1" className="py-6 h-14 text-base font-medium rounded-xl" {...register("roadWidth", { valueAsNumber: true })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Số tầng</Label>
                      <Input type="number" className="py-6 h-14 text-base font-medium rounded-xl" {...register("floors", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Phòng ngủ</Label>
                      <Input type="number" className="py-6 h-14 text-base font-medium rounded-xl" {...register("bedrooms", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Phòng tắm</Label>
                      <Input type="number" className="py-6 h-14 text-base font-medium rounded-xl" {...register("toilets", { valueAsNumber: true })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pháp lý</Label>
                        <Controller
                          control={control}
                          name="legalStatus"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""} items={legalStatuses}>
                              <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl">
                                <SelectValue placeholder="Chọn pháp lý" />
                              </SelectTrigger>
                              <SelectContent>
                                {legalStatuses.map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ghi chú pháp lý</Label>
                        <Textarea placeholder="Chi tiết về số tờ, số thửa..." className="min-h-[100px] text-base rounded-xl" {...register("legalNote")} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Nội thất</Label>
                        <Controller
                          control={control}
                          name="interiorStatus"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""} items={interiorStatuses}>
                              <SelectTrigger className="py-6 h-14 text-base font-medium rounded-xl">
                                <SelectValue placeholder="Chọn nội thất" />
                              </SelectTrigger>
                              <SelectContent>
                                {interiorStatuses.map(s => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ghi chú nội thất</Label>
                        <Textarea placeholder="Liệt kê các thiết bị đi kèm..." className="min-h-[100px] text-base rounded-xl" {...register("interiorNote")} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-8 focus-visible:outline-none">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Mô tả bài đăng</Label>
                    <Textarea 
                      placeholder="Mô tả chi tiết các ưu điểm, tiện ích xung quanh..." 
                      className="min-h-[300px] text-base leading-relaxed rounded-2xl border-slate-200 p-6" 
                      {...register("description")}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Thẻ & Đặc điểm</Label>
                    
                    <Controller
                      control={control}
                      name="tags"
                      render={({ field }) => {
                        const currentTags = field.value ? field.value.split(",").map(t => t.trim()).filter(Boolean) : [];
                        
                        const toggleTag = (tagName: string) => {
                          let newTags;
                          if (currentTags.includes(tagName)) {
                            newTags = currentTags.filter(t => t !== tagName);
                          } else {
                            newTags = [...currentTags, tagName];
                          }
                          field.onChange(newTags.join(", "));
                        };

                        return (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-4 min-h-[60px] bg-slate-50 rounded-xl border border-dashed border-slate-300">
                              {currentTags.length > 0 ? (
                                currentTags.map(tag => (
                                  <Badge key={tag} className="py-1.5 px-3 bg-white text-primary border-primary flex items-center gap-2 rounded-lg group">
                                    {tag}
                                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => toggleTag(tag)} />
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-slate-400 text-sm italic">Chưa chọn thẻ nào...</span>
                              )}
                            </div>

                            <div className="space-y-3">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gợi ý từ hệ thống</p>
                              <div className="flex flex-wrap gap-2">
                                {availableTags.map(tag => (
                                  <Badge 
                                    key={tag.id} 
                                    variant="outline"
                                    className={cn(
                                      "py-2 px-4 cursor-pointer transition-all rounded-xl",
                                      currentTags.includes(tag.name) 
                                        ? "bg-primary text-white border-primary shadow-md" 
                                        : "hover:bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                    onClick={() => toggleTag(tag.name)}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-8 focus-visible:outline-none">
                  {/* Property Images Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-primary" /> Hình ảnh bất động sản
                        </Label>
                        <p className="text-xs text-slate-400 font-medium italic">Tối đa 10 ảnh. Ảnh đầu tiên sẽ được dùng làm ảnh bìa.</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={currentImages.filter(img => img.type === "PROPERTY").length + newImages.length >= 10}
                        className="rounded-xl font-bold border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:border-primary shrink-0"
                        onClick={() => document.getElementById("property-images-upload")?.click()}
                      >
                        <ImagePlus className="w-4 h-4 mr-2" /> Thêm ảnh
                      </Button>
                      <input 
                        id="property-images-upload" 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const newEntries = files.map(file => ({
                            file,
                            preview: URL.createObjectURL(file)
                          }));
                          setNewImages(prev => [...prev, ...newEntries]);
                          e.target.value = ""; // Reset
                        }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {/* Existing Property Images */}
                      {currentImages.filter(img => img.type === "PROPERTY").map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                          <img src={img.url} alt="Property" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl"
                              onClick={() => {
                                setDeletedImageIds(prev => [...prev, img.id]);
                                setCurrentImages(prev => prev.filter(i => i.id !== img.id));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* New Property Images */}
                      {newImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary/20 group shadow-sm bg-slate-50">
                          <img src={img.preview} alt="New" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Mới</div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl"
                              onClick={() => {
                                URL.revokeObjectURL(img.preview);
                                setNewImages(prev => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {currentImages.filter(img => img.type === "PROPERTY").length + newImages.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                          <div className="p-4 bg-white rounded-2xl shadow-sm mb-3">
                            <Camera className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold text-sm">Chưa có hình ảnh nào được tải lên.</p>
                          <p className="text-slate-300 text-xs mt-1">Sử dụng nút phía trên để thêm ảnh.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate Images Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" /> Hình ảnh pháp lý (Sổ hồng/Sổ đỏ)
                        </Label>
                        <p className="text-xs text-slate-400 font-medium italic">Ảnh pháp lý sẽ giúp tin đăng được ưu tiên và tin cậy hơn.</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="rounded-xl font-bold border-dashed border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 shrink-0"
                        onClick={() => document.getElementById("cert-images-upload")?.click()}
                      >
                        <ImagePlus className="w-4 h-4 mr-2" /> Thêm ảnh sổ
                      </Button>
                      <input 
                        id="cert-images-upload" 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const newEntries = files.map(file => ({
                            file,
                            preview: URL.createObjectURL(file)
                          }));
                          setNewCertificateImages(prev => [...prev, ...newEntries]);
                          e.target.value = "";
                        }} 
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {/* Existing Certificate Images */}
                      {currentImages.filter(img => img.type === "CERTIFICATE").map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                          <img src={img.url} alt="Certificate" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl"
                              onClick={() => {
                                setDeletedImageIds(prev => [...prev, img.id]);
                                setCurrentImages(prev => prev.filter(i => i.id !== img.id));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* New Certificate Images */}
                      {newCertificateImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500/20 group shadow-sm bg-slate-50">
                          <img src={img.preview} alt="New Cert" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Mới</div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl"
                              onClick={() => {
                                URL.revokeObjectURL(img.preview);
                                setNewCertificateImages(prev => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="py-6 px-8 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-white h-14"
            >
              <X className="mr-2 h-5 w-5" /> Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="py-6 px-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-14"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
