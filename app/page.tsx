"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated && user?.role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    if (isAuthenticated) {
      clearAuth();
    }

    router.replace("/login");
  }, [clearAuth, hydrated, isAuthenticated, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-slate-600" />
        <p className="text-sm text-slate-400">Đang chuyển hướng...</p>
      </div>
    </main>
  );
}
