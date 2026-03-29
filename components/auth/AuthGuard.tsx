"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      useAuthStore.getState().clearAuth();
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
