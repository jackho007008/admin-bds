"use client";

import { useAuthStore } from "@/store/authStore";

function toBookingLabel(user?: { fullName?: string; email?: string }) {
  const base =
    user?.fullName?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "villa";

  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();

  if (!normalized) {
    return "villabooking";
  }

  return normalized.endsWith("booking")
    ? normalized
    : `${normalized}booking`;
}

export function CustomerHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="px-6 py-4">
        <h1 className="text-[18px] font-bold tracking-[-0.02em] text-slate-900">
          {toBookingLabel(user || undefined)}
        </h1>
      </div>
    </header>
  );
}
