"use client";

import React, { useState, useEffect, useCallback } from "react";
import { locationService, LocationItem } from "@/services/locationService";
import { 
  Compass, 
  RefreshCcw,
  CheckCircle2,
  Circle,
  Loader2,
  Home,
  AlertCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DiscoveryPage() {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [allWards, setAllWards] = useState<LocationItem[]>([]);
  const [selectedWardIds, setSelectedWardIds] = useState<number[]>([]);
  
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Provinces on mount
  const fetchProvinces = useCallback(async () => {
    setIsLoadingProvinces(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
      if (data.length > 0 && !selectedProvinceCode) {
        setSelectedProvinceCode(data[0].code);
      }
    } catch {
      toast.error("Không thể tải danh sách tỉnh thành.");
    } finally {
      setIsLoadingProvinces(false);
    }
  }, [selectedProvinceCode]);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // Fetch Wards and Current Discovery when province changes
  const fetchWardsAndDiscovery = useCallback(async (provinceCode: string) => {
    setIsLoadingWards(true);
    try {
      const [wards, discovery] = await Promise.all([
        locationService.getWardsByProvince(provinceCode),
        locationService.getDiscoveryWards(provinceCode)
      ]);
      setAllWards(wards);
      setSelectedWardIds(discovery.map((d: any) => d.wardId));
    } catch {
      toast.error("Không thể tải dữ liệu xã/phường.");
    } finally {
      setIsLoadingWards(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProvinceCode) {
      fetchWardsAndDiscovery(selectedProvinceCode);
    }
  }, [selectedProvinceCode, fetchWardsAndDiscovery]);

  const toggleWard = (id: number) => {
    setSelectedWardIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(w => w !== id);
      } else {
        if (prev.length >= 4) {
          toast.warning("Bạn chỉ được chọn đúng 4 xã/phường cho mục Khám phá.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedProvinceCode) return;
    if (selectedWardIds.length !== 4) {
      toast.error("Bạn phải chọn đúng 4 xã/phường để hiển thị.");
      return;
    }

    setIsSaving(true);
    try {
      await locationService.updateDiscoveryWards(selectedProvinceCode, selectedWardIds);
      toast.success("Đã cập nhật danh sách khám phá thành công!");
      fetchWardsAndDiscovery(selectedProvinceCode);
    } catch {
      toast.error("Không thể lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentProvince = provinces.find(p => p.code === selectedProvinceCode);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý khám phá</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">
            Chọn 4 xã/phường tiêu biểu cho mỗi tỉnh thành để hiển thị ở mục Khám phá trên App.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => selectedProvinceCode && fetchWardsAndDiscovery(selectedProvinceCode)} 
            disabled={!selectedProvinceCode || isLoadingWards}
            className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-sm"
          >
            <RefreshCcw className={isLoadingWards ? "w-3.5 h-3.5 mr-2 animate-spin" : "w-3.5 h-3.5 mr-2"} /> Làm mới
          </Button>
          <Button 
            disabled={selectedWardIds.length !== 4 || isSaving}
            onClick={handleSave}
            className="h-10 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 text-sm text-white min-w-[120px]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu cấu hình
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Province Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm min-h-[400px]">
            <div className="p-4 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-emerald-600">Chọn Tỉnh/Thành phố</span>
            </div>
            <div className="space-y-1 p-2">
              {isLoadingProvinces ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))
              ) : (
                provinces.map((province) => (
                  <button
                    key={province.code}
                    onClick={() => setSelectedProvinceCode(province.code)}
                    className={cn(
                      "w-full text-left p-3.5 px-5 rounded-xl text-sm font-bold transition-all",
                      selectedProvinceCode === province.code 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {province.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ward Selector Main Area */}
        <div className="lg:col-span-3 space-y-4">
          <Alert className="bg-emerald-50 border-emerald-100 rounded-2xl">
            <AlertCircle className="h-5 w-5 text-emerald-600" />
            <AlertTitle className="text-emerald-800 font-bold">Lưu ý cấu hình</AlertTitle>
            <AlertDescription className="text-emerald-700 text-sm font-medium">
              Bạn đang cấu hình cho <strong>{currentProvince?.name || "..."}</strong>. 
              Vui lòng chọn <strong>đúng 4 xã/phường</strong> để hiển thị. Hiện đã chọn: {selectedWardIds.length}/4.
            </AlertDescription>
          </Alert>

          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Danh sách Xã/Phường tại {currentProvince?.name}</span>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold",
                selectedWardIds.length === 4 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-red-100 text-red-700"
              )}>
                {selectedWardIds.length === 4 ? "Đã chọn đủ 4" : `Đã chọn ${selectedWardIds.length}/4`}
              </span>
            </div>

            <div className="p-6">
              {isLoadingWards ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : allWards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Home className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-medium text-sm">Không tìm thấy dữ liệu xã/phường.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allWards.map((ward) => {
                    const isSelected = selectedWardIds.includes(ward.id);
                    return (
                      <button
                        key={ward.id}
                        onClick={() => toggleWard(ward.id)}
                        className={cn(
                          "flex items-center justify-between p-4 px-6 rounded-2xl border transition-all text-left group",
                          isSelected 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                            : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-slate-50/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Home className={cn(
                            "w-4 h-4 transition-colors",
                            isSelected ? "text-emerald-600" : "text-slate-300 group-hover:text-emerald-400"
                          )} />
                          <span className="text-sm font-bold truncate">{ward.name}</span>
                        </div>
                        <div className={cn(
                          "shrink-0 transition-colors",
                          isSelected ? "text-emerald-600" : "text-slate-200 group-hover:text-slate-300"
                        )}>
                          {isSelected ? (
                            <CheckCircle2 className="w-6 h-6 shadow-sm rounded-full" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
