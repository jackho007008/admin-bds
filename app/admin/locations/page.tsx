"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Building2,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PendingState = {
  provinces: Record<number, { isActive: boolean; cascade: boolean }>;
  districts: Record<number, { isActive: boolean; cascade: boolean }>;
  wards: Record<number, { isActive: boolean }>;
};

const initialPendingState: PendingState = {
  provinces: {},
  districts: {},
  wards: {},
};

export default function LocationsPage() {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districtsCache, setDistrictsCache] = useState<Record<number, LocationItem[]>>({});
  const [wardsCache, setWardsCache] = useState<Record<number, LocationItem[]>>({});
  const [expandedProvinces, setExpandedProvinces] = useState<Set<number>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<number>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<PendingState>(initialPendingState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProvinces = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
      setPendingChanges(initialPendingState);
    } catch {
      toast.error("Không thể tải danh sách tỉnh thành.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProvinces();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProvinces]);

  const fetchDistricts = useCallback(async (provinceId: number, force = false) => {
    if (!force && districtsCache[provinceId]) return;
    try {
      const data = await locationService.getDistrictsByProvince(provinceId);
      setDistrictsCache((prev) => ({ ...prev, [provinceId]: data }));
    } catch {
      toast.error("Không thể tải danh sách quận huyện.");
    }
  }, [districtsCache]);

  const fetchWards = useCallback(async (districtId: number, force = false) => {
    if (!force && wardsCache[districtId]) return;
    try {
      const data = await locationService.getWardsByDistrict(districtId);
      setWardsCache((prev) => ({ ...prev, [districtId]: data }));
    } catch {
      toast.error("Không thể tải danh sách phường xã.");
    }
  }, [wardsCache]);

  const toggleProvinceExpansion = (provinceId: number) => {
    setExpandedProvinces((prev) => {
      const next = new Set(prev);
      if (next.has(provinceId)) next.delete(provinceId);
      else {
        next.add(provinceId);
        void fetchDistricts(provinceId);
      }
      return next;
    });
  };

  const toggleDistrictExpansion = (districtId: number) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(districtId)) next.delete(districtId);
      else {
        next.add(districtId);
        void fetchWards(districtId);
      }
      return next;
    });
  };

  const handleProvinceToggle = (provinceId: number, currentActive: boolean) => {
    const nextActive = !currentActive;
    setPendingChanges((prev) => {
      const next: PendingState = {
        provinces: {
          ...prev.provinces,
          [provinceId]: { isActive: nextActive, cascade: true },
        },
        districts: { ...prev.districts },
        wards: { ...prev.wards },
      };

      const districts = districtsCache[provinceId] || [];
      districts.forEach((district) => {
        next.districts[district.id] = { isActive: nextActive, cascade: true };
        const wards = wardsCache[district.id] || [];
        wards.forEach((ward) => {
          next.wards[ward.id] = { isActive: nextActive };
        });
      });

      return next;
    });
  };

  const handleDistrictToggle = (districtId: number, currentActive: boolean) => {
    const nextActive = !currentActive;
    setPendingChanges((prev) => {
      const next: PendingState = {
        ...prev,
        districts: {
          ...prev.districts,
          [districtId]: { isActive: nextActive, cascade: true },
        },
        wards: { ...prev.wards },
      };

      const wards = wardsCache[districtId] || [];
      wards.forEach((ward) => {
        next.wards[ward.id] = { isActive: nextActive };
      });

      return next;
    });
  };

  const handleWardToggle = (wardId: number, currentActive: boolean) => {
    const nextActive = !currentActive;
    setPendingChanges((prev) => ({
      ...prev,
      wards: {
        ...prev.wards,
        [wardId]: { isActive: nextActive },
      },
    }));
  };

  const hasChanges = useMemo(() => {
    return (
      Object.keys(pendingChanges.provinces).length > 0 ||
      Object.keys(pendingChanges.districts).length > 0 ||
      Object.keys(pendingChanges.wards).length > 0
    );
  }, [pendingChanges]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await locationService.updateLocationsBulk({
        provinces: Object.entries(pendingChanges.provinces).map(([id, value]) => ({
          id: Number(id),
          ...value,
        })),
        districts: Object.entries(pendingChanges.districts).map(([id, value]) => ({
          id: Number(id),
          ...value,
        })),
        wards: Object.entries(pendingChanges.wards).map(([id, value]) => ({
          id: Number(id),
          ...value,
        })),
      });

      toast.success("Đã lưu cấu hình địa chỉ 3 cấp thành công!");
      await fetchProvinces();

      await Promise.all(
        [...expandedProvinces].map(async (provinceId) => {
          await fetchDistricts(provinceId, true);
        }),
      );

      await Promise.all(
        [...expandedDistricts].map(async (districtId) => {
          await fetchWards(districtId, true);
        }),
      );
    } catch {
      toast.error("Không thể lưu cấu hình địa chỉ.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProvinces = useMemo(() => {
    return provinces.filter((province) =>
      province.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [provinces, search]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="rounded-lg bg-emerald-50 p-1.5">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản lý địa chỉ
            </h2>
          </div>
          <p className="ml-1 text-sm font-medium text-slate-500">
            Quản lý địa chỉ 3 cấp cũ: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchProvinces()}
            className="h-10 rounded-xl border-slate-200 px-4 text-sm font-bold hover:bg-slate-50"
          >
            <RefreshCcw
              className={cn("mr-2 h-3.5 w-3.5", isLoading && "animate-spin")}
            />
            Làm mới
          </Button>
          <Button
            disabled={!hasChanges || isSaving}
            onClick={handleSave}
            className="h-10 min-w-[120px] rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
        <div className="group relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
          <Input
            placeholder="Tìm kiếm tỉnh thành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-slate-100 bg-slate-50/50 pl-11 text-sm font-medium shadow-none transition-all focus:bg-white"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredProvinces.length === 0 ? (
            <div className="p-20 text-center text-sm font-medium text-slate-400">
              Không tìm thấy kết quả phù hợp.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredProvinces.map((province) => {
                const isExpanded = expandedProvinces.has(province.id);
                const pendingProvince = pendingChanges.provinces[province.id];
                const provinceActive = pendingProvince
                  ? pendingProvince.isActive
                  : province.isActive;

                return (
                  <div key={province.id} className="group">
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-2xl p-4 px-6 transition-all",
                        isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/50",
                      )}
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <button
                          type="button"
                          onClick={() => toggleProvinceExpansion(province.id)}
                          className="rounded-lg border border-transparent p-1 shadow-none transition-colors hover:border-slate-200 hover:bg-white hover:shadow-sm"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "rounded-xl p-2 transition-colors",
                              provinceActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-400",
                            )}
                          >
                            <MapPin className="h-5 w-5" />
                          </div>
                          <span
                            className={cn(
                              "text-[16px] font-bold transition-colors",
                              provinceActive ? "text-slate-900" : "text-slate-400",
                            )}
                          >
                            {province.name}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleProvinceToggle(province.id, provinceActive)
                        }
                        className={cn(
                          "rounded-full p-2 transition-all",
                          provinceActive
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-slate-300 hover:bg-slate-100",
                        )}
                      >
                        {provinceActive ? (
                          <CheckCircle2 className="h-7 w-7" />
                        ) : (
                          <Circle className="h-7 w-7" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 pb-6 pl-14 pr-6 pt-1">
                        {districtsCache[province.id] === undefined ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                          </div>
                        ) : districtsCache[province.id]?.length === 0 ? (
                          <div className="py-4 text-center text-sm italic text-slate-400">
                            Không có dữ liệu quận huyện cho tỉnh này.
                          </div>
                        ) : (
                          districtsCache[province.id]?.map((district) => {
                            const districtExpanded = expandedDistricts.has(
                              district.id,
                            );
                            const pendingDistrict =
                              pendingChanges.districts[district.id];
                            const districtActive = pendingDistrict
                              ? pendingDistrict.isActive
                              : district.isActive;

                            return (
                              <div
                                key={district.id}
                                className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60"
                              >
                                <div className="flex items-center justify-between px-5 py-4">
                                  <div className="flex flex-1 items-center gap-4">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleDistrictExpansion(district.id)
                                      }
                                      className="rounded-lg border border-transparent p-1 transition-colors hover:border-slate-200 hover:bg-white"
                                    >
                                      {districtExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                      )}
                                    </button>
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "rounded-xl p-2 transition-colors",
                                          districtActive
                                            ? "bg-white text-emerald-600"
                                            : "bg-slate-100 text-slate-400",
                                        )}
                                      >
                                        <Building2 className="h-4 w-4" />
                                      </div>
                                      <span
                                        className={cn(
                                          "text-sm font-bold transition-colors",
                                          districtActive
                                            ? "text-slate-900"
                                            : "text-slate-400",
                                        )}
                                      >
                                        {district.name}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDistrictToggle(
                                        district.id,
                                        districtActive,
                                      )
                                    }
                                    className={cn(
                                      "rounded-full p-1.5 transition-all",
                                      districtActive
                                        ? "text-emerald-600 hover:bg-emerald-50"
                                        : "text-slate-300 hover:bg-slate-100",
                                    )}
                                  >
                                    {districtActive ? (
                                      <CheckCircle2 className="h-6 w-6" />
                                    ) : (
                                      <Circle className="h-6 w-6" />
                                    )}
                                  </button>
                                </div>

                                {districtExpanded && (
                                  <div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {wardsCache[district.id] === undefined ? (
                                      <div className="col-span-full flex justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                                      </div>
                                    ) : wardsCache[district.id]?.length === 0 ? (
                                      <div className="col-span-full py-2 text-center text-sm italic text-slate-400">
                                        Không có dữ liệu phường xã.
                                      </div>
                                    ) : (
                                      wardsCache[district.id]?.map((ward) => {
                                        const pendingWard =
                                          pendingChanges.wards[ward.id];
                                        const wardActive = pendingWard
                                          ? pendingWard.isActive
                                          : ward.isActive;

                                        return (
                                          <div
                                            key={ward.id}
                                            className={cn(
                                              "flex items-center justify-between rounded-2xl border p-3 px-4 transition-all",
                                              wardActive
                                                ? "border-emerald-100 bg-emerald-50/30 text-emerald-700"
                                                : "border-slate-100 bg-slate-50/50 text-slate-400",
                                            )}
                                          >
                                            <div className="flex items-center gap-3">
                                              <Home
                                                className={cn(
                                                  "h-4 w-4",
                                                  wardActive
                                                    ? "text-emerald-500"
                                                    : "text-slate-300",
                                                )}
                                              />
                                              <span className="text-sm font-bold">
                                                {ward.name}
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleWardToggle(ward.id, wardActive)
                                              }
                                              className={cn(
                                                "rounded-full p-1.5 transition-all",
                                                wardActive
                                                  ? "text-emerald-500 hover:bg-emerald-50"
                                                  : "text-slate-200 hover:bg-slate-100",
                                              )}
                                            >
                                              {wardActive ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                              ) : (
                                                <Circle className="h-5 w-5" />
                                              )}
                                            </button>
                                          </div>
                                        );
                                      })
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
