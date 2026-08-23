"use client";

import { useState } from "react";
import type { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  villaImportService,
  type CustomerAccountStatus,
} from "@/services/villaImportService";
import { KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  customerName?: string;
  accountStatus?: CustomerAccountStatus | null;
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const message = axiosError.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] || fallback;
  }

  return message || fallback;
}

function CustomerAccountModalBody({
  customerId,
  customerName,
  accountStatus,
  onClose,
}: Omit<CustomerAccountModalProps, "isOpen">) {
  const queryClient = useQueryClient();
  const hasAccount = Boolean(accountStatus?.hasAccount);
  const [email, setEmail] = useState(accountStatus?.account?.email || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(
    accountStatus?.account?.fullName || customerName || "",
  );

  const refreshQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["villaImportCustomers"] }),
      queryClient.invalidateQueries({
        queryKey: ["customerAccount", customerId],
      }),
    ]);
  };

  const createAccountMutation = useMutation({
    mutationFn: () => {
      if (!customerId) {
        throw new Error("Thiếu chủ villa cần tạo tài khoản");
      }

      return villaImportService.createCustomerAccount(customerId, {
        email: email.trim(),
        password,
        fullName: fullName.trim() || customerName,
      });
    },
    onSuccess: async () => {
      toast.success("Đã tạo tài khoản cho chủ villa");
      await refreshQueries();
      onClose();
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Không tạo được tài khoản cho chủ villa"),
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => {
      if (!customerId) {
        throw new Error("Thiếu chủ villa cần reset mật khẩu");
      }

      return villaImportService.resetCustomerAccountPassword(customerId, {
        password,
      });
    },
    onSuccess: async () => {
      toast.success("Đã reset mật khẩu cho chủ villa");
      await refreshQueries();
      onClose();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Không reset được mật khẩu"));
    },
  });

  const isSaving =
    createAccountMutation.isPending || resetPasswordMutation.isPending;

  const handleSubmit = () => {
    if (!customerId) {
      toast.error("Chọn chủ villa trước");
      return;
    }

    if (!hasAccount) {
      if (!email.trim()) {
        toast.error("Nhập email đăng nhập");
        return;
      }

      if (!password.trim()) {
        toast.error("Nhập mật khẩu");
        return;
      }

      createAccountMutation.mutate();
      return;
    }

    if (!password.trim()) {
      toast.error("Nhập mật khẩu mới");
      return;
    }

    resetPasswordMutation.mutate();
  };

  return (
    <>
      <div className="space-y-5 px-8 py-7">
        {hasAccount ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Tài khoản hiện tại:{" "}
            <span className="font-semibold">{accountStatus?.account?.email}</span>
          </div>
        ) : null}

        {!hasAccount ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="customerAccountEmail">Tài khoản đăng nhập</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="customerAccountEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email dùng để chủ villa đăng nhập"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAccountFullName">Tên hiển thị</Label>
              <Input
                id="customerAccountFullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tên hiển thị của chủ villa"
              />
            </div>
          </>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="customerAccountPassword">
            {hasAccount ? "Mật khẩu mới" : "Mật khẩu"}
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="customerAccountPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                hasAccount
                  ? "Nhập mật khẩu mới cho chủ villa"
                  : "Nhập mật khẩu ban đầu"
              }
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-8 py-6 sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="rounded-2xl"
        >
          Đóng
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !customerId}
          className="rounded-2xl"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {hasAccount ? "Reset mật khẩu" : "Tạo tài khoản"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function CustomerAccountModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  accountStatus,
}: CustomerAccountModalProps) {
  const formKey = `${customerId || "no-customer"}-${accountStatus?.account?.updatedAt || "new"}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-[2rem] border-none p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-8 py-7 text-left">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Tài khoản chủ villa
          </div>
          <DialogTitle className="pt-3 text-2xl font-bold text-slate-900">
            {accountStatus?.hasAccount
              ? "Reset mật khẩu"
              : "Thiết lập tài khoản cho chủ villa"}
          </DialogTitle>
          <DialogDescription className="text-base leading-7 text-slate-500">
            {customerName
              ? `Chủ villa đang thao tác: ${customerName}`
              : "Chọn chủ villa trước khi cấu hình tài khoản."}
          </DialogDescription>
        </DialogHeader>

        {isOpen ? (
          <CustomerAccountModalBody
            key={formKey}
            onClose={onClose}
            customerId={customerId}
            customerName={customerName}
            accountStatus={accountStatus}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
