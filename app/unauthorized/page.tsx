"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function UnauthorizedPage() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Bạn không có quyền vào trang admin
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-500">
          {user?.email
            ? `Tài khoản ${user.email} đã đăng nhập thành công nhưng không có quyền truy cập khu quản trị.`
            : "Tài khoản của bạn không có quyền truy cập khu quản trị."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-2xl">
            <Link href="/login">Quay lại đăng nhập</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={clearAuth}
          >
            Đăng xuất tài khoản này
          </Button>
        </div>
      </div>
    </div>
  );
}
