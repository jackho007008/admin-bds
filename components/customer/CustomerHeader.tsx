"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function CustomerHeader() {
  const user = useAuthStore((state) => state.user);
  const canOpenAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <h1 className="text-[18px] font-bold tracking-[-0.02em] text-slate-900">
          Villa Booking
        </h1>

        {canOpenAdmin ? (
          <Link
            href="/admin/villa-owners"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Trang quản trị</span>
            <span className="sm:hidden">Quản trị</span>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
