"use client";

import { MessageCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SystemSettingsTemplateProps {
  adminZalo: string;
  setAdminZalo: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isLoading: boolean;
}

export function SystemSettingsTemplate({
  adminZalo,
  setAdminZalo,
  onSubmit,
  isPending,
  isLoading,
}: SystemSettingsTemplateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cấu hình hệ thống</h1>
          <p className="text-slate-500">Quản lý các thiết lập chung của toàn bộ ứng dụng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-800">Thông tin liên hệ</h2>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 mr-4">
                Số Zalo admin
              </label>
              <Input
                value={adminZalo}
                onChange={(e) => setAdminZalo(e.target.value)}
                placeholder="VD: 0901234567"
                className="max-w-[200px]"
              />
              <p className="text-xs text-slate-400">
                Hiện ở nút &quot;Liên hệ admin qua Zalo&quot; trên màn đăng nhập App Mobile và khi villa không có số chủ nhà.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="flex items-center gap-2" disabled={isPending}>
                <Save className="w-4 h-4" />
                {isPending ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
