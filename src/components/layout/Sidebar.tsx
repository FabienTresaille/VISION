"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radar,
  Lightbulb,
  FolderKanban,
  Archive,
  Rss,
  Settings,
  Eye,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/veille", label: "Veille Techno", icon: Rss },
  { href: "/detection", label: "Détection", icon: Lightbulb },
  { href: "/offres", label: "Offres", icon: FolderKanban },
  { href: "/historique", label: "Historique", icon: Archive },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.06] bg-surface-1/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Vision</h1>
          <p className="text-[11px] text-gray-500 font-medium tracking-wider uppercase">
            Alsek ESN
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-4 py-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="glass-card !p-3 text-center">
          <p className="text-[11px] text-gray-500">Vision v1.0</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Alsek © 2026</p>
        </div>
      </div>
    </aside>
  );
}
