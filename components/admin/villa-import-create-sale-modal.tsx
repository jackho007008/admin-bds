"use client";

import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AppModalBody,
  AppModalContent,
  AppModalDescription,
  AppModalFooter,
  AppModalHeader,
  AppModalTitle,
} from "@/components/ui/app-modal";
import type { CreateSaleModalProps } from "@/components/admin/villa-import-management.types";

export function VillaImportCreateSaleModal({
  isOpen,
  saleFullName,
  saleEmail,
  salePassword,
  isSubmitting,
  onOpenChange,
  onSaleFullNameChange,
  onSaleEmailChange,
  onSalePasswordChange,
  onSubmit,
  onClose,
}: CreateSaleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AppModalContent className="sm:max-w-xl">
        <AppModalHeader>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Tạo mới sale
          </div>
          <AppModalTitle className="pt-3">Tạo sale</AppModalTitle>
          <AppModalDescription>
            Sale được tạo ở đây sẽ dùng quyền Sales.
          </AppModalDescription>
        </AppModalHeader>

        <AppModalBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="saleFullName">Tên sale</Label>
            <Input
              id="saleFullName"
              value={saleFullName}
              onChange={(e) => onSaleFullNameChange(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saleEmail">Email đăng nhập</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="saleEmail"
                value={saleEmail}
                onChange={(e) => onSaleEmailChange(e.target.value)}
                placeholder="sale@villabooking.vn"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salePassword">Mật khẩu</Label>
            <Input
              id="salePassword"
              type="password"
              value={salePassword}
              onChange={(e) => onSalePasswordChange(e.target.value)}
              placeholder="Nhập mật khẩu ban đầu"
            />
          </div>
        </AppModalBody>

        <AppModalFooter>
          <Button type="button" variant="ghost" className="rounded-2xl" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting} className="rounded-2xl">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Tạo sale
          </Button>
        </AppModalFooter>
      </AppModalContent>
    </Dialog>
  );
}
