"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  Briefcase,
  MapPin,
  Compass,
  Tags,
  Settings,
  Building2,
  FileText,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: FileText, label: "Quản lý bài đăng", href: "/admin/posts" },
  { icon: Users, label: "Quản lý user", href: "/admin/users" },
  { icon: UserCheck, label: "Duyệt nhân viên", href: "/admin/users/pending" },
  { icon: Briefcase, label: "Quản lý phòng ban", href: "/admin/departments" },
  { icon: MapPin, label: "Quản lý địa chỉ", href: "/admin/locations" },
  { icon: Compass, label: "Quản lý khám phá", href: "/admin/locations/discovery" },
  { icon: Tags, label: "Quản lý tag", href: "/admin/tags" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#0F612D] text-white h-screen fixed left-0 top-0 flex flex-col z-50 border-r border-[#1a7a3a]/30">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          <span>BDS Admin</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              pathname === item.href 
                ? "bg-primary text-white" 
                : "text-white/70 hover:bg-[#1a7a3a]/40 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a7a3a]/30">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-white hover:bg-[#1a7a3a]/40 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
