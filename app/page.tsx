"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerSearchForm } from "@/components/customer/CustomerSearchForm";
import { useAuthStore } from "@/store/authStore";
import { CustomerShell } from "@/components/customer/CustomerShell";
import {
  Building2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function CustomerHome() {
  const { clearAuth } = useAuthStore();

  return (
    <CustomerShell>
      <section className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <CustomerSearchForm />
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl px-6"
            onClick={clearAuth}
          >
            Đăng xuất
          </Button>
        </div>
      </section>
    </CustomerShell>
  );
}

export default function HomePage() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "DAU_KHACH";

  if (isAuthenticated && isCustomer) {
    return <CustomerHome />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
              <Building2 className="h-4 w-4" />
              Villa Booking Portal
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900">
                Trang chung cho tài khoản khách và quản trị
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-500">
                Tài khoản đầu khách có thể đăng nhập và đứng ở trang này. Tài khoản
                admin vẫn vào được đây và có thể mở nhanh khu quản trị khi cần.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isAuthenticated ? (
                <Button asChild className="rounded-2xl px-6">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              ) : null}

              {isAdmin ? (
                <Button asChild className="rounded-2xl px-6">
                  <Link href="/admin/villa-owners">Vào quản trị</Link>
                </Button>
              ) : null}

              {isAuthenticated ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl px-6"
                  onClick={clearAuth}
                >
                  Đăng xuất
                </Button>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  {isAdmin ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <UserRound className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">
                    Trạng thái hiện tại
                  </div>
                  <div className="text-xl font-semibold text-slate-900">
                    {isAuthenticated
                      ? isAdmin
                        ? "Đang đăng nhập bằng tài khoản admin"
                        : "Đang đăng nhập bằng tài khoản khách"
                      : "Chưa đăng nhập"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-500">Tài khoản</div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {user?.email || "Chưa có"}
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  Quyền hiện tại: {user?.role || "Khách chưa đăng nhập"}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
