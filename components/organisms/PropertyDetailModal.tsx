"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Property, PropertyType, PropertyStatus, LegalStatus, InteriorStatus } from "@/types/property";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  MapPin, 
  DollarSign, 
  Maximize, 
  Layout, 
  Bed, 
  Bath, 
  Layers, 
  User, 
  Calendar,
  Tag
} from "lucide-react";

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const propertyTypeLabels: Record<PropertyType, string> = {
  MAT_PHO: "Mặt phố",
  BIET_THU: "Biệt thự",
  CHUNG_CU: "Chung cư",
  CHUNG_CU_MINI: "Chung cư mini",
  DAT_NEN: "Đất nền",
  NHA_RIENG: "Nhà riêng",
  VAN_PHONG: "Văn phòng",
  KHACH_SAN: "Khách sạn",
  KHAC: "Khác",
};

const legalStatusLabels: Record<LegalStatus, string> = {
  SO_HONG: "Sổ hồng",
  SO_DO: "Sổ đỏ",
  GIAY_TAY: "Giấy tay",
  DANG_CHO_SO: "Đang chờ sổ",
  CHUA_XAC_DINH: "Chưa xác định",
};

const interiorStatusLabels: Record<InteriorStatus, string> = {
  DAY_DU: "Đầy đủ",
  CO_BAN: "Cơ bản",
  NHA_THO: "Nhà thô",
  CHUA_XAC_DINH: "Chưa xác định",
};

const statusLabels: Record<PropertyStatus, { label: string; color: string }> = {
  DANG_BAN: { label: "Đang bán", color: "bg-green-100 text-green-700 border-green-200" },
  DUNG_BAN: { label: "Dừng bán", color: "bg-red-100 text-red-700 border-red-200" },
  CHU_BAN: { label: "Chủ bán", color: "bg-blue-100 text-blue-700 border-blue-200" },
  CONG_TY_BAN: { label: "Công ty bán", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

export function PropertyDetailModal({ property, isOpen, onClose, isLoading }: PropertyDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Đang tải thông tin chi tiết...</p>
        </div>
      );
    }

    if (!property) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <p className="text-slate-400 font-medium">Không tìm thấy thông tin bất động sản.</p>
        </div>
      );
    }

    const statusInfo = statusLabels[property.status];

    return (
      <>
        <DialogHeader className="p-8 pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-3 text-left">
              <DialogTitle className="text-3xl font-bold leading-tight tracking-tight text-slate-900 line-clamp-2">
                {property.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge variant="outline" className={`${statusInfo.color} border px-4 py-1.5 text-sm font-semibold uppercase tracking-wider`}>
                  {statusInfo.label}
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider">
                  {propertyTypeLabels[property.type]}
                </Badge>
                <span className="text-sm text-slate-400 self-center ml-2 font-mono tracking-tight">ID: {property.id}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-8 pt-2 space-y-10">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full max-w-lg grid-cols-3 bg-slate-100/50 p-1.5 mb-8">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 font-bold text-base">Tổng quan</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 font-bold text-base">Chi tiết</TabsTrigger>
                <TabsTrigger value="info" className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 font-bold text-base">Thông tin khác</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-10 focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-start gap-6">
                      <div className="mt-1 p-4 bg-primary/10 rounded-2xl text-primary shadow-sm">
                        <DollarSign className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Giá bán niêm yết</p>
                        <p className="text-3xl font-semibold text-primary tracking-tight">{formatCurrency(property.price)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="mt-1 p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-sm border border-blue-100/50">
                        <Maximize className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Diện tích sử dụng thực tế</p>
                        <p className="text-2xl font-semibold text-slate-900 tracking-tight">{property.actualArea ? `${property.actualArea} m²` : "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      <div className="mt-1 p-4 bg-slate-50 rounded-2xl text-slate-600 shadow-sm border border-slate-100">
                        <MapPin className="h-7 w-7" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vị trí & Địa chỉ</p>
                        <p className="text-slate-900 font-semibold leading-relaxed text-xl">{property.addressRaw}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <Badge variant="outline" className="text-xs font-bold text-slate-500 border-slate-200 px-3 py-1 uppercase tracking-tighter">
                            {property.ward || "Xã/Phường"}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-bold text-slate-500 border-slate-200 px-3 py-1 uppercase tracking-tighter">
                            {property.district || "Quận/Huyện"}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-bold text-slate-500 border-slate-200 px-3 py-1 uppercase tracking-tighter">
                            {property.province || "Tỉnh/Thành"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col shadow-inner">
                    <div className="flex items-center gap-3 mb-6 text-slate-900 font-bold text-base uppercase tracking-widest">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                      <span>Mô tả chi tiết bất động sản</span>
                    </div>
                    <ScrollArea className="flex-1 min-h-[300px]">
                      <p className="text-slate-600 text-lg leading-loose whitespace-pre-wrap pr-6 font-medium font-inter">
                        {property.description || "Chủ đầu tư chưa cung cấp mô tả chi tiết cho bài đăng này."}
                      </p>
                    </ScrollArea>
                  </div>
                </div>

                {property.addressOnPaper && (
                  <div className="bg-amber-50/30 p-8 rounded-[1.5rem] flex items-center gap-6 border border-amber-100/50 shadow-sm">
                    <div className="p-3 bg-amber-100/50 rounded-xl text-amber-600">
                      <Layout className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-[0.2em] mb-2">Thông tin pháp lý: Địa chỉ trên sổ</p>
                      <p className="text-lg text-amber-900 font-semibold leading-normal">{property.addressOnPaper}</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-10 focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { icon: Bed, label: "Phòng ngủ", value: property.bedrooms, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { icon: Bath, label: "Phòng tắm", value: property.toilets, color: "text-cyan-500", bg: "bg-cyan-50" },
                    { icon: Layers, label: "Số tầng", value: property.floors, color: "text-amber-500", bg: "bg-amber-50" },
                    { icon: Maximize, label: "Diện tích sổ", value: property.paperArea ? `${property.paperArea} m²` : "N/A", color: "text-emerald-500", bg: "bg-emerald-50" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200 group">
                      <div className={`p-4 w-fit ${item.bg} rounded-2xl mb-6 group-hover:scale-105 transition-transform`}>
                        <item.icon className={`h-8 w-8 ${item.color}`} />
                      </div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 block">{item.label}</span>
                      <span className="text-3xl font-semibold text-slate-900">{item.value || 0}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                  <div className="space-y-8">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-2 h-7 bg-primary rounded-full"></div>
                      Tổ chức Pháp lý & Giấy tờ
                    </h4>
                    <div className="grid grid-cols-1 gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                      <div className="flex justify-between items-center group">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loại giấy tờ</p>
                        <Badge variant="outline" className="font-bold bg-white text-slate-700 border-slate-200 px-5 py-2 rounded-full shadow-sm text-sm uppercase tracking-wider">
                          {property.legalStatus ? legalStatusLabels[property.legalStatus] : "Đang xác minh"}
                        </Badge>
                      </div>
                      <Separator className="bg-slate-200/50" />
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ghi chú chi tiết</p>
                        <p className="text-lg text-slate-700 font-medium leading-relaxed">{property.legalNote || "Không có ghi chú bổ sung về pháp lý."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                      <div className="w-2 h-7 bg-blue-500 rounded-full"></div>
                      Tình trạng Nội thất & Trang thiết bị
                    </h4>
                    <div className="grid grid-cols-1 gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                      <div className="flex justify-between items-center group">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mức độ hoàn thiện</p>
                        <Badge variant="outline" className="font-bold bg-white text-slate-700 border-slate-200 px-5 py-2 rounded-full shadow-sm text-sm uppercase tracking-wider">
                          {property.interiorStatus ? interiorStatusLabels[property.interiorStatus] : "Đang cập nhật"}
                        </Badge>
                      </div>
                      <Separator className="bg-slate-200/50" />
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ghi chú hiện trạng</p>
                        <p className="text-lg text-slate-700 font-medium leading-relaxed">{property.interiorNote || "Chưa có thông tin về trang thiết bị nội thất."}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-8">
                  <div className="flex justify-between items-center p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chiều ngang mặt tiền</p>
                    </div>
                    <span className="text-slate-900 font-semibold text-2xl">{property.frontageWidth ? `${property.frontageWidth}m` : "—"}</span>
                  </div>
                  <div className="flex justify-between items-center p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Độ rộng đường vào</p>
                    </div>
                    <span className="text-slate-900 font-semibold text-2xl">{property.roadWidth ? `${property.roadWidth}m` : "—"}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-10 focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4">
                        <User className="h-5 w-5 text-slate-300" /> Đại diện Đăng tin
                      </h4>
                      {property.creator ? (
                        <div className="flex items-center gap-6 p-8 border rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-all group">
                          <div className="h-20 w-20 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl group-hover:scale-105 transition-transform">
                            {property.creator.fullName.charAt(0)}
                          </div>
                          <div className="space-y-2">
                            <p className="font-semibold text-slate-900 text-2xl tracking-tight leading-none">{property.creator.fullName}</p>
                            <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-500 font-bold px-3 py-1 border border-slate-100 uppercase tracking-widest">
                              Chức vụ: {property.creator.role}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed rounded-[2rem] bg-slate-50 text-center">
                          <p className="text-base text-slate-400 italic font-medium">Dữ liệu người đăng không tồn tại trên hệ thống.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-slate-300" /> Bản ghi Lịch sử hệ thống
                      </h4>
                      <div className="space-y-3 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                        <div className="flex justify-between text-base py-4 border-b border-slate-200/50">
                          <span className="font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            Khởi tạo lúc
                          </span>
                          <span className="font-semibold text-slate-700">{format(new Date(property.createdAt), "HH:mm, dd/MM/yyyy", { locale: vi })}</span>
                        </div>
                        <div className="flex justify-between text-base py-4 pt-5">
                          <span className="font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                            Hiệu chỉnh lần cuối
                          </span>
                          <span className="font-semibold text-slate-700">{format(new Date(property.updatedAt), "HH:mm, dd/MM/yyyy", { locale: vi })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4">
                      <Tag className="h-5 w-5 text-slate-300" /> Hệ thống Thẻ & Đặc điểm (Tags)
                    </h4>
                    <div className="flex flex-wrap gap-4 bg-slate-50/50 p-10 rounded-[2rem] border border-slate-100 min-h-[250px] content-start shadow-inner">
                      {property.tags && property.tags.length > 0 ? (
                        property.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-white border-2 border-slate-100 text-slate-700 font-semibold px-5 py-3 text-sm shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-default rounded-full">
                            #{tag}
                          </Badge>
                        ))
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center gap-4 opacity-30 mt-12">
                          <Tag className="h-10 w-10" />
                          <p className="text-sm font-bold uppercase tracking-widest">Không có nhãn phân loại</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl max-w-[calc(100%-2rem)] max-h-[95vh] p-0 overflow-hidden flex flex-col rounded-[2.5rem] border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
