"use client";

import { useState, useEffect } from "react";
import { Archive, Search, Calendar, AlertCircle, RefreshCw, Loader2, GitBranch, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

const STEP_NAMES = ["Détection", "Analyse", "CDC & Maquettage", "Offre commerciale", "Validation", "Commercialisation", "Suivi"];

export default function HistoriquePage() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resumingId, setResumingId] = useState<string | null>(null);

  const loadOffers = () => {
    fetch("/api/offers?status=rejected")
      .then((r) => r.json())
      .then(setOffers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOffers(); }, []);

  const filtered = offers.filter((o: any) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.rejectionReason || "").toLowerCase().includes(search.toLowerCase())
  );

  const resumeOffer = async (offerId: string) => {
    if (!confirm("Créer une nouvelle version de cette offre ? L'offre actuelle restera dans l'historique.")) return;
    setResumingId(offerId);
    const res = await fetch(`/api/offers/${offerId}/resume`, { method: "POST" });
    if (res.ok) {
      const newOffer = await res.json();
      router.push(`/offres/${newOffer.id}`);
    } else {
      alert("Erreur lors de la reprise");
      setResumingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Historique des offres non retenues</h2>
          <p className="text-sm text-gray-500 mt-1">{offers.length} offre(s) rejetée(s) avec motif</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/[0.08]">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card h-32 animate-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Archive className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Aucune offre rejetée</p>
          <p className="text-gray-600 text-sm mt-2">Les offres non retenues apparaîtront ici avec leur motif</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((offer: any) => (
            <div key={offer.id} className="glass-card border-red-500/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold text-white">{offer.name}</h3>
                    {offer.version > 1 && (
                      <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">V{offer.version}</span>
                    )}
                    {offer.category && (
                      <span className="badge" style={{ backgroundColor: `${offer.category.color}15`, color: offer.category.color, border: `1px solid ${offer.category.color}30` }}>{offer.category.name}</span>
                    )}
                    <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">Rejetée à l&apos;étape {offer.currentStep}</span>
                  </div>

                  {/* Tags */}
                  {offer.offerTags?.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag className="w-3 h-3 text-gray-600" />
                      {offer.offerTags.map((t: any) => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${t.category.color}10`, color: t.category.color }}>
                          {t.subCategory ? t.subCategory.name : t.category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Version links */}
                  {offer.parentOffer && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                      <GitBranch className="w-3 h-3" />
                      <span>Issue de</span>
                      <a href={`/offres/${offer.parentOffer.id}`} className="text-brand-400 hover:text-brand-300">{offer.parentOffer.name}</a>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Étape de rejet : {STEP_NAMES[offer.currentStep]}</span>
                    <span>Progression au rejet : {offer.progressPercent}%</span>
                    {offer.rejectedAt && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(offer.rejectedAt).toLocaleDateString("fr-FR")}</span>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/10">
                    <p className="text-xs text-gray-500 font-medium mb-1">Motif de rejet :</p>
                    <p className="text-sm text-gray-300">{offer.rejectionReason || "Aucun motif renseigné"}</p>
                  </div>
                </div>

                {/* Resume button */}
                <button
                  onClick={() => resumeOffer(offer.id)}
                  disabled={resumingId === offer.id}
                  className="btn-primary flex items-center gap-2 flex-shrink-0 mt-1"
                >
                  {resumingId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Reprendre
                </button>
              </div>

              {/* Mini progress */}
              <div className="flex items-center gap-1 mt-4">
                {[0, 1, 2, 3, 4, 5, 6].map((step) => {
                  const s = offer.steps?.find((os: any) => os.stepNumber === step);
                  const color = s?.status === "completed" ? "#10b981" : s?.status === "in_progress" ? "#ef4444" : "rgba(255,255,255,0.06)";
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[9px] text-gray-600">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
