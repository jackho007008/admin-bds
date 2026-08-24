"use client";

import { Bell, Menu, Search, UserCircle } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:left-64 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 md:max-w-md">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            type="text"
            placeholder="Search properties, users..."
            className="w-full min-w-0 bg-transparent border-none outline-none text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 md:gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-2 md:pl-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <button className="p-1 rounded-full border border-slate-200 hover:border-slate-300 transition-colors">
            <UserCircle className="w-8 h-8 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
