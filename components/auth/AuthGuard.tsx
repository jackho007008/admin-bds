"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ADMIN_ROLES = new Set(["ADMIN", "DAU_CHU"]);
const DAU_CHU_ALLOWED_PATHS = new Set([
  "/admin",
  "/admin/villa-owners",
  "/admin/posts",
]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (!ADMIN_ROLES.has(user.role)) {
      router.replace("/");
      return;
    }

    if (user.role === "DAU_CHU" && !DAU_CHU_ALLOWED_PATHS.has(pathname)) {
      router.replace("/admin/villa-owners");
    }
  }, [hydrated, isAuthenticated, pathname, router, user]);

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

  if (!isAuthenticated || !user || !ADMIN_ROLES.has(user.role)) {
    return null;
  }

  if (user.role === "DAU_CHU" && !DAU_CHU_ALLOWED_PATHS.has(pathname)) {
    return null;
  }

  return <>{children}</>;
}
