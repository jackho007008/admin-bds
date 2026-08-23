"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Heart, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: Search, label: "Search" },
  { href: "/saved", icon: Heart, label: "Saved" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/notifications", icon: Bell, label: "Notifications", badge: "2" },
  { href: "/menu", icon: Menu, label: "Menu" },
];

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-5xl px-3 pb-3">
      <div className="grid h-20 grid-cols-5 items-center rounded-[1.75rem] border border-slate-200 bg-white px-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex justify-center transition-colors",
                active ? "text-slate-800" : "text-slate-400",
              )}
            >
              <Icon className="h-7 w-7" strokeWidth={2.2} />
              {item.badge ? (
                <span className="absolute right-[calc(50%-18px)] top-[-4px] flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
