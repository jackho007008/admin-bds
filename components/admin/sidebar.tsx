"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  MapPin,
  Building2,
  LogOut,
  Users,
  ShieldCheck,
  X,
  House,
  SquarePen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appTheme } from "@/lib/theme";

const adminMenuItems = [
  { icon: MapPin, label: "Quản lý địa chỉ", href: "/admin/locations" },
  { icon: Users, label: "Quản lý chủ villa", href: "/admin/villa-owners" },
  { icon: ShieldCheck, label: "Quản lý sales", href: "/admin/sales" },
];

const ownerMenuItems = [
  { icon: House, label: "Danh sách villa", href: "/admin/villa-owners" },
  { icon: SquarePen, label: "Đăng tin", href: "/admin/posts" },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const menuItems = user?.role === "DAU_CHU" ? ownerMenuItems : adminMenuItems;

  const handleLogout = () => {
    clearAuth();
    onClose?.();
    router.push("/login");
  };

  return (
    <>
      <button
        type="button"
        aria-label="Đóng menu"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/18 backdrop-blur-[2px] transition-opacity md:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        style={{
          borderRightColor: appTheme.colors.primaryBorder,
        }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r bg-white/95 text-slate-900 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-transform duration-300 md:w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-5 md:p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2
              className="w-6 h-6"
              style={{ color: appTheme.colors.primary }}
            />
            <span>{appTheme.brandName}</span>
          </h1>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors md:hidden"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                appTheme.colors.primarySoft;
              e.currentTarget.style.color = appTheme.colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              style={
                pathname === item.href
                  ? {
                      backgroundColor: appTheme.colors.primary,
                      color: "#ffffff",
                    }
                  : undefined
              }
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                pathname === item.href
                  ? "text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.backgroundColor =
                    appTheme.colors.primarySoft;
                  e.currentTarget.style.color = appTheme.colors.primaryText;
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.color = "";
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div
          className="p-4 border-t"
          style={{ borderTopColor: appTheme.colors.primaryBorder }}
        >
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-600 transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                appTheme.colors.primarySoft;
              e.currentTarget.style.color = appTheme.colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
}
