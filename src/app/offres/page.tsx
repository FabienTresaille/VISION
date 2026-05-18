"use client";

import { useState, useEffect } from "react";
import { FolderKanban, ArrowRight, Search, AlertTriangle, Clock, Tag } from "lucide-react";
import Link from "next/link";

const STEP_NAMES = ["Détection", "Analyse", "CDC & Maquettage", "Offre commerciale", "Validation", "Commercialisation", "Suivi"];
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_progress: { label: "En cours", color: "#3b82f6" },
  validated: { label: "Validée", color: "#10b981" },
  rejected: { label: "Rejetée", color: "#ef4444" },
  archived: { label: "Archivée", color: "#6b7280" },
};

export default function OffresPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (tagFilter) params.set("tagCategoryId", tagFilter);
    fetch(`/api/offers?${params}`)
      .then((r) => r.json())
      .then(setOffers)
      .finally(() => setLoading(false));
  }, [statusFilter, tagFilter]);

  const filtered = offers.filter((o: any) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Suivi des Offres</h2>
          <p className="text-sm text-gray-500 mt-1">{offers.length} offre(s) au total</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/[0.08]">
            <Search className="w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-40" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-gray-300 outline-none">
            <option value="">Tous les statuts</option>
            <option value="in_progress">En cours</option>
            <option value="validated">Validées</option>
            <option value="rejected">Rejetées</option>
          </select>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-gray-300 outline-none">
            <option value="">Toutes catégories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card h-24 animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Aucune offre trouvée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((offer: any) => {
            const st = STATUS_LABELS[offer.status] || STATUS_LABELS.in_progress;
            const currentStep = offer.steps?.find((s: any) => s.status === "in_progress");
            const nextAction = currentStep?.actions?.find((a: any) => a.status !== "completed");
            const slaExceeded = currentStep?.slaWeeks && currentStep?.startedAt && !currentStep?.completedAt &&
              (Date.now() - new Date(currentStep.startedAt).getTime()) > currentStep.slaWeeks * 7 * 24 * 60 * 60 * 1000;
            const slaWarning = currentStep?.slaWeeks && currentStep?.startedAt && !currentStep?.completedAt &&
              (Date.now() - new Date(currentStep.startedAt).getTime()) > currentStep.slaWeeks * 7 * 24 * 60 * 60 * 1000 * 0.8;

            return (
              <Link key={offer.id} href={`/offres/${offer.id}`} className="glass-card flex items-center gap-5 group cursor-pointer">
                {/* Progress circle */}
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke={st.color} strokeWidth="4" strokeDasharray={`${(offer.progressPercent / 100) * 150.8} 150.8`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{offer.progressPercent}%</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-brand-400 transition-colors">{offer.name}</h3>
                    {offer.version > 1 && (
                      <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">V{offer.version}</span>
                    )}
                    <span className="badge" style={{ backgroundColor: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30` }}>{st.label}</span>
                    {offer.category && <span className="badge bg-white/5 text-gray-400 border border-white/[0.06]">{offer.category.name}</span>}
                    {slaExceeded && (
                      <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> SLA Dépassé
                      </span>
                    )}
                    {!slaExceeded && slaWarning && (
                      <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Retard
                      </span>
                    )}
                  </div>
                  {/* Tags */}
                  {offer.offerTags?.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Tag className="w-3 h-3 text-gray-600" />
                      {offer.offerTags.slice(0, 4).map((t: any) => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${t.category.color}10`, color: t.category.color }}>
                          {t.subCategory ? t.subCategory.name : t.category.name}
                        </span>
                      ))}
                      {offer.offerTags.length > 4 && <span className="text-[10px] text-gray-600">+{offer.offerTags.length - 4}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Étape {offer.currentStep}/6 — {STEP_NAMES[offer.currentStep]}</span>
                    {nextAction && <span className="text-amber-400">→ {nextAction.label}</span>}
                  </div>
                </div>

                {/* Mini step indicators */}
                <div className="hidden md:flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((step) => {
                    const s = offer.steps?.find((os: any) => os.stepNumber === step);
                    const color = s?.status === "completed" ? "#10b981" : s?.status === "in_progress" ? "#3b82f6" : "rgba(255,255,255,0.08)";
                    return <div key={step} className="w-6 h-1.5 rounded-full transition-all" style={{ backgroundColor: color }} />;
                  })}
                </div>

                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
