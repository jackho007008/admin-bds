"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemSettingsService } from "@/services/systemSettingsService";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { SystemSettingsTemplate } from "@/components/templates/SystemSettingsTemplate";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [maxViews, setMaxViews] = useState<number>(10);
  const [adminZalo, setAdminZalo] = useState<string>("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: () => systemSettingsService.getSettings(),
  });

  useEffect(() => {
    if (settings && maxViews !== settings.maxHiddenInfoViewsPerDay) {
      setMaxViews(settings.maxHiddenInfoViewsPerDay);
    }
    if (settings) {
      setAdminZalo(settings.adminZalo ?? "");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      systemSettingsService.updateSettings({
        maxHiddenInfoViewsPerDay: maxViews,
        adminZalo: adminZalo.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Cập nhật cấu hình thành công!");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <SystemSettingsTemplate
      maxViews={maxViews}
      setMaxViews={setMaxViews}
      adminZalo={adminZalo}
      setAdminZalo={setAdminZalo}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      isLoading={isLoading}
    />
  );
}
