"use client";

import { Bell, Search, UserCircle } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white fixed top-0 right-0 left-64 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-md w-96 max-w-full">
        <Search className="w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search properties, users..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
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
