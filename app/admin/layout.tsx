"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-col min-h-screen md:pl-64">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pt-20 md:p-8 md:pt-24">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
