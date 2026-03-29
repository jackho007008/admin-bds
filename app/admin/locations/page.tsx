"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { locationService, LocationItem } from "@/services/locationService";
import { 
  MapPin, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Save, 
  RefreshCcw,
  CheckCircle2,
  Circle,
  Loader2,
  Building,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LocationsPage() {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  // Cache for child items
  const [districtsCache, setDistrictsCache] = useState<Record<number, LocationItem[]>>({});
  const [wardsCache, setWardsCache] = useState<Record<number, LocationItem[]>>({});
  
  // UI State
  const [expandedProvinces, setExpandedProvinces] = useState<Set<number>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<number>>(new Set());
  
  // Pending changes: state of toggles before saving
  const [pendingChanges, setPendingChanges] = useState<{
    provinces: Record<number, { isActive: boolean; cascade: boolean }>;
    districts: Record<number, { isActive: boolean; cascade: boolean }>;
    wards: Record<number, { isActive: boolean }>;
  }>({ provinces: {}, districts: {}, wards: {} });

  const fetchProvinces = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
      // Reset pending changes on refresh
      setPendingChanges({ provinces: {}, districts: {}, wards: {} });
    } catch {
      toast.error("Không thể tải danh sách tỉnh thành.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const fetchDistricts = async (provinceId: number) => {
    if (districtsCache[provinceId]) return;
    try {
      const data = await locationService.getDistricts(provinceId);
      setDistrictsCache(prev => ({ ...prev, [provinceId]: data }));
    } catch {
      toast.error("Không thể tải danh sách quận huyện.");
    }
  };

  const fetchWards = async (districtId: number) => {
    if (wardsCache[districtId]) return;
    try {
      const data = await locationService.getWards(districtId);
      setWardsCache(prev => ({ ...prev, [districtId]: data }));
    } catch {
      toast.error("Không thể tải danh sách phường xã.");
    }
  };

  const toggleProvinceExpansion = (id: number) => {
    setExpandedProvinces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        fetchDistricts(id);
      }
      return next;
    });
  };

  const toggleDistrictExpansion = (id: number) => {
    setExpandedDistricts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        fetchWards(id);
      }
      return next;
    });
  };

  const handleProvinceToggle = (provinceId: number, currentActive: boolean) => {
    const nextActive = !currentActive;
    setPendingChanges(prev => {
      const nextProvinces = { ...prev.provinces, [provinceId]: { isActive: nextActive, cascade: true } };
      const nextDistricts = { ...prev.districts };
      const nextWards = { ...prev.wards };
      
      // Cascade to cached items
      const districts = districtsCache[provinceId];
      if (districts) {
        districts.forEach(d => {
          nextDistricts[d.id] = { isActive: nextActive, cascade: true };
          const wards = wardsCache[d.id];
          if (wards) {
            wards.forEach(w => {
              nextWards[w.id] = { isActive: nextActive };
            });
          }
        });
      }
      return { ...prev, provinces: nextProvinces, districts: nextDistricts, wards: nextWards };
    });
  };

  const handleDistrictToggle = (districtId: number, currentActive: boolean) => {
    const nextActive = !currentActive;
    setPendingChanges(prev => {
      const nextDistricts = { ...prev.districts, [districtId]: { isActive: nextActive, cascade: true } };
      const nextWards = { ...prev.wards };
      
      // Cascade to cached items
      const wards = wardsCache[districtId];
      if (wards) {
        wards.forEach(w => {
          nextWards[w.id] = { isActive: nextActive };
        });
      }
      return { ...prev, districts: nextDistricts, wards: nextWards };
    });
  };

  const handleWardToggle = (wardId: number, currentActive: boolean) => {
    const nextActive = !currentActive;
    setPendingChanges(prev => ({
      ...prev,
      wards: { ...prev.wards, [wardId]: { isActive: nextActive } }
    }));
  };

  const hasChanges = useMemo(() => {
    return Object.keys(pendingChanges.provinces).length > 0 ||
           Object.keys(pendingChanges.districts).length > 0 ||
           Object.keys(pendingChanges.wards).length > 0;
  }, [pendingChanges]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pUpdates = Object.entries(pendingChanges.provinces).map(([id, val]) => ({ id: Number(id), ...val }));
      const dUpdates = Object.entries(pendingChanges.districts).map(([id, val]) => ({ id: Number(id), ...val }));
      const wUpdates = Object.entries(pendingChanges.wards).map(([id, val]) => ({ id: Number(id), ...val }));

      await locationService.updateLocationsBulk({
        provinces: pUpdates.length > 0 ? pUpdates : undefined,
        districts: dUpdates.length > 0 ? dUpdates : undefined,
        wards: wUpdates.length > 0 ? wUpdates : undefined,
      });
      
      toast.success("Đã lưu cấu hình địa chỉ thành công!");
      fetchProvinces(); // Refresh to clear visual state and reload from server
    } catch {
      toast.error("Không thể lưu cấu hình địa chỉ.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProvinces = provinces.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý địa chỉ</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-1">
            Bật/tắt hiển thị Tỉnh thành, Quận huyện và Phường xã trên ứng dụng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchProvinces()} 
            className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-slate-50 text-sm"
          >
            <RefreshCcw className={isLoading ? "w-3.5 h-3.5 mr-2 animate-spin" : "w-3.5 h-3.5 mr-2"} /> Làm mới
          </Button>
          <Button 
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
            className="h-10 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 text-sm text-white min-w-[120px]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input 
            placeholder="Tìm kiếm tỉnh thành..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 text-sm font-medium rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all shadow-none"
          />
        </div>
      </div>

      {/* Location Tree */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-2">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredProvinces.length === 0 ? (
            <div className="p-20 text-center text-slate-400 font-medium text-sm">
              Không tìm thấy kết quả phù hợp.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredProvinces.map((province) => {
                const isExpanded = expandedProvinces.has(province.id);
                const isPending = pendingChanges.provinces[province.id];
                const isActive = isPending ? isPending.isActive : province.isActive;
                const districts = districtsCache[province.id] || [];

                return (
                  <div key={province.id} className="group">
                    {/* Province Row */}
                    <div className={cn(
                      "flex items-center justify-between p-4 px-6 rounded-2xl transition-all",
                      isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                    )}>
                      <div className="flex items-center gap-4 flex-1">
                        <button 
                          onClick={() => toggleProvinceExpansion(province.id)}
                          className="p-1 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className={cn(
                            "font-bold text-[16px] transition-colors",
                            isActive ? "text-slate-900" : "text-slate-400"
                          )}>
                            {province.name}
                            {isPending && <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Chờ lưu</span>}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleProvinceToggle(province.id, isActive)}
                        className={cn(
                          "p-2 rounded-full transition-all",
                          isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-100"
                        )}
                      >
                        {isActive ? (
                          <CheckCircle2 className="w-7 h-7" />
                        ) : (
                          <Circle className="w-7 h-7" />
                        )}
                      </button>
                    </div>

                    {/* Districts Level */}
                    {isExpanded && (
                      <div className="pl-16 pr-6 pb-4 space-y-2 mt-1">
                        {districts.length === 0 ? (
                          <div className="py-4 flex justify-center">
                            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                          </div>
                        ) : (
                          districts.map((district) => {
                            const isDistExpanded = expandedDistricts.has(district.id);
                            const isDistPending = pendingChanges.districts[district.id];
                            const isDistActive = isDistPending ? isDistPending.isActive : district.isActive;
                            const wards = wardsCache[district.id] || [];

                            return (
                              <div key={district.id} className="rounded-xl overflow-hidden border border-slate-50 bg-slate-50/30">
                                {/* District Row */}
                                <div className="flex items-center justify-between p-3 px-5 transition-colors">
                                  <div className="flex items-center gap-3 flex-1">
                                    <button 
                                      onClick={() => toggleDistrictExpansion(district.id)}
                                      className="p-1 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm"
                                    >
                                      {isDistExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                      )}
                                    </button>
                                    <div className="flex items-center gap-2">
                                      <Building className={cn(
                                        "w-4 h-4",
                                        isDistActive ? "text-emerald-500" : "text-slate-300"
                                      )} />
                                      <span className={cn(
                                        "text-sm font-bold",
                                        isDistActive ? "text-slate-700" : "text-slate-400"
                                      )}>
                                        {district.name}
                                        {isDistPending && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-emerald-500">Pending</span>}
                                      </span>
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => handleDistrictToggle(district.id, isDistActive)}
                                    className={cn(
                                      "p-1.5 rounded-full transition-all",
                                      isDistActive ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-200 hover:bg-slate-100"
                                    )}
                                  >
                                    {isDistActive ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>

                                {/* Wards Level */}
                                {isDistExpanded && (
                                  <div className="pl-12 pr-4 pb-4 space-y-1">
                                    {wards.length === 0 ? (
                                      <div className="py-2 flex justify-center">
                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {wards.map((ward) => {
                                          const isWardPending = pendingChanges.wards[ward.id];
                                          const isWardActive = isWardPending ? isWardPending.isActive : ward.isActive;

                                          return (
                                            <div 
                                              key={ward.id}
                                              className={cn(
                                                "flex items-center justify-between p-2.5 px-4 rounded-xl border transition-all",
                                                isWardActive 
                                                  ? "bg-white border-emerald-100 text-emerald-700 shadow-sm" 
                                                  : "bg-slate-50/50 border-slate-100 text-slate-400"
                                              )}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Home className="w-3.5 h-3.5 opacity-70" />
                                                <span className="text-xs font-bold leading-none">{ward.name}</span>
                                              </div>
                                              <button 
                                                onClick={() => handleWardToggle(ward.id, isWardActive)}
                                                className={cn(
                                                  "p-1 rounded-full",
                                                  isWardActive ? "text-emerald-500" : "text-slate-200"
                                                )}
                                              >
                                                {isWardActive ? (
                                                  <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                  <Circle className="w-4 h-4" />
                                                )}
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
