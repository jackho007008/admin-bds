"use client";

import { KeyRound, Loader2, Mail, Users } from "lucide-react";
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
import type { CreateOwnerModalProps } from "@/components/admin/villa-import-management.types";

export function VillaImportCreateOwnerModal({
  isOpen,
  customerName,
  customerNotes,
  customerAccountEmail,
  customerAccountPassword,
  customerAccountFullName,
  isSubmitting,
  onOpenChange,
  onCustomerNameChange,
  onCustomerNotesChange,
  onCustomerAccountEmailChange,
  onCustomerAccountPasswordChange,
  onCustomerAccountFullNameChange,
  onSubmit,
  onClose,
}: CreateOwnerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AppModalContent className="sm:max-w-2xl">
        <AppModalHeader>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <Users className="h-4 w-4" />
            Tạo mới chủ villa
          </div>
          <AppModalTitle className="pt-3">Tạo chủ villa và tài khoản</AppModalTitle>
        </AppModalHeader>

        <AppModalBody className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customerName">Tên chủ villa</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Ví dụ: Tracy Trips"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerNotes">Ghi chú</Label>
            <Textarea
              id="customerNotes"
              value={customerNotes}
              onChange={(e) => onCustomerNotesChange(e.target.value)}
              placeholder="Nguồn sheet, nhóm sales, ghi chú thêm..."
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Tạo tài khoản đăng nhập
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Điền phần này nếu muốn tạo luôn tài khoản cho chủ villa.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customerAccountEmail">Tài khoản đăng nhập</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="customerAccountEmail"
                    value={customerAccountEmail}
                    onChange={(e) => onCustomerAccountEmailChange(e.target.value)}
                    placeholder="chu-villa@villabooking.vn"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAccountFullName">Tên hiển thị</Label>
                <Input
                  id="customerAccountFullName"
                  value={customerAccountFullName}
                  onChange={(e) => onCustomerAccountFullNameChange(e.target.value)}
                  placeholder="Mặc định lấy theo tên chủ villa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAccountPassword">Mật khẩu</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="customerAccountPassword"
                    type="password"
                    value={customerAccountPassword}
                    onChange={(e) => onCustomerAccountPasswordChange(e.target.value)}
                    placeholder="Nhập mật khẩu ban đầu"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </AppModalBody>

        <AppModalFooter>
          <Button type="button" variant="ghost" className="rounded-2xl" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" className="rounded-2xl" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            Tạo chủ villa
          </Button>
        </AppModalFooter>
      </AppModalContent>
    </Dialog>
  );
}
