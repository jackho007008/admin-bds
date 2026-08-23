"use client";

import { CustomerBottomNav } from "@/components/customer/CustomerBottomNav";
import { CustomerHeader } from "@/components/customer/CustomerHeader";

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white pb-28">
      <CustomerHeader />
      {children}
      <CustomerBottomNav />
    </main>
  );
}
