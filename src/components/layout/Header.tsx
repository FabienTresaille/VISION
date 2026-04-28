"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Search, Menu, LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/veille": "Veille Technologique",
  "/detection": "Détection d'Offres",
  "/offres": "Suivi des Offres",
  "/historique": "Historique",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title =
    pageTitles[pathname] ||
    (pathname.startsWith("/offres/") ? "Détail de l'Offre" : "Vision");

  const initials = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email?.charAt(0).toUpperCase() || "A";

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-white/[0.06] bg-surface-1/30 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Menu className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/[0.08] w-64">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 border border-white/[0.06] transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50" />
        </button>

        {/* User info + Logout */}
        {session?.user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-white font-medium">{session.user.name || session.user.email}</p>
              <p className="text-[10px] text-gray-500">{(session.user as any).role || "user"}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {initials}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4 text-gray-500 hover:text-red-400 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
