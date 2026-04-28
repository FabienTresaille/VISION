"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Newspaper,
  FlaskConical,
  ArrowRight,
  Clock,
  Zap,
  X,
} from "lucide-react";

interface DashboardData {
  kpis: {
    inProgress: number;
    validated: number;
    rejected: number;
    total: number;
    articlesToday: number;
    pendingTests: number;
  };
  recentOffers: any[];
  recentActivity: any[];
  offersByStep: any[];
}

const STEP_NAMES = [
  "Détection",
  "Analyse",
  "CDC & Maquettage",
  "Offre commerciale",
  "Validation",
  "Commercialisation",
  "Suivi",
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-32 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || { inProgress: 0, validated: 0, rejected: 0, total: 0, articlesToday: 0, pendingTests: 0 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Solutions en cours"
          value={kpis.inProgress}
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-blue-500 to-cyan-500"
          shadowColor="shadow-blue-500/20"
          href="/offres?status=in_progress"
        />
        <KpiCard
          title="Offres validées"
          value={kpis.validated}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="from-emerald-500 to-green-500"
          shadowColor="shadow-emerald-500/20"
          href="/offres?status=validated"
        />
        <KpiCard
          title="Non retenues"
          value={kpis.rejected}
          icon={<XCircle className="w-5 h-5" />}
          color="from-red-500 to-orange-500"
          shadowColor="shadow-red-500/20"
          href="/historique"
        />
        <KpiCard
          title="Articles veille (24h)"
          value={kpis.articlesToday}
          icon={<Newspaper className="w-5 h-5" />}
          color="from-purple-500 to-pink-500"
          shadowColor="shadow-purple-500/20"
          href="/veille"
        />
      </div>

      {/* Pipeline + Top Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 glass-card-static">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Pipeline des offres</h3>
            <a href="/offres" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {STEP_NAMES.map((name, i) => {
              const count = data?.offersByStep?.find((s: any) => s.stepNumber === i)?._count || 0;
              return (
                <div key={i} className="text-center">
                  <div
                    className={`h-20 rounded-xl flex items-center justify-center text-2xl font-bold mb-2 transition-all
                      ${count > 0
                        ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                        : "bg-white/[0.02] text-gray-600 border border-white/[0.04]"
                      }`}
                  >
                    {count}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card-static">
          <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowTestModal(true)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              Demande de test
            </button>
            <a href="/veille" className="w-full btn-secondary flex items-center justify-center gap-2">
              <Newspaper className="w-4 h-4" />
              Consulter la veille
            </a>
            <a href="/detection" className="w-full btn-secondary flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Détecter des offres
            </a>
          </div>

          {/* Pending tests */}
          {kpis.pendingTests > 0 && (
            <a href="/demandes-test" className="block mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
              <p className="text-xs text-amber-400">
                <span className="font-bold">{kpis.pendingTests}</span> demande(s) de test en attente
              </p>
            </a>
          )}
        </div>
      </div>

      {/* Top Offers in Progress */}
      <div className="glass-card-static">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Offres en cours</h3>
          <a href="/offres" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Toutes les offres <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        {data?.recentOffers && data.recentOffers.length > 0 ? (
          <div className="space-y-3">
            {data.recentOffers.map((offer: any) => {
              const currentAction = offer.steps?.[0]?.actions?.[0];
              return (
                <a
                  key={offer.id}
                  href={`/offres/${offer.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${offer.category?.color || '#2563eb'}20`, color: offer.category?.color || '#2563eb' }}
                  >
                    {offer.progressPercent}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-400 transition-colors">
                      {offer.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Étape {offer.currentStep} — {STEP_NAMES[offer.currentStep]}
                      {currentAction && ` • ${currentAction.label}`}
                    </p>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 progress-bar-fill"
                      style={{ width: `${offer.progressPercent}%` }}
                    />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-400 transition-colors" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune offre en cours</p>
            <p className="text-xs mt-1">Consultez la veille pour détecter des opportunités</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="glass-card-static">
          <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
          <div className="space-y-3">
            {data.recentActivity.map((action: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-gray-400 flex-1">
                  <span className="text-white font-medium">{action.step?.offer?.name}</span>
                  {" — "}
                  {action.label}
                </span>
                <span className="text-xs text-gray-600">
                  {action.completedAt && new Date(action.completedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Request Modal */}
      {showTestModal && <TestRequestModal onClose={() => setShowTestModal(false)} />}
    </div>
  );
}

// ─── KPI Card Component ─────────────────────────────────────

function KpiCard({
  title,
  value,
  icon,
  color,
  shadowColor,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  shadowColor: string;
  href: string;
}) {
  return (
    <a href={href} className="glass-card group cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg ${shadowColor} group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
    </a>
  );
}

// ─── FolderOpen icon (inline) ───────────────────────────────
function FolderOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
    </svg>
  );
}

// ─── Test Request Modal ─────────────────────────────────────

function TestRequestModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    solutionName: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/test-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg mx-4 glass-card-static !p-0 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">Demande de test</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-white font-medium">Demande envoyée avec succès !</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium">Nom</label>
              <input
                type="text"
                required
                value={form.requesterName}
                onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                className="input-field mt-1"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Email</label>
              <input
                type="email"
                required
                value={form.requesterEmail}
                onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                className="input-field mt-1"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Solution à tester</label>
              <input
                type="text"
                required
                value={form.solutionName}
                onChange={(e) => setForm({ ...form, solutionName: e.target.value })}
                className="input-field mt-1"
                placeholder="Ex: Acronis Cyber Protect"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Description de la demande</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field mt-1 min-h-[100px] resize-none"
                placeholder="Décrivez le besoin et le contexte..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
