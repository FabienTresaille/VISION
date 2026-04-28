"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle, Loader2, X, ChevronDown, ChevronUp, Shield } from "lucide-react";

const STEP_NAMES = ["Détection", "Analyse (Go/NoGo)", "CDC & Maquettage", "Création offre commerciale", "Validation (Gatekeeper)", "Commercialisation", "Suivi"];

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completingAction, setCompletingAction] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadOffer = async () => {
    const res = await fetch(`/api/offers/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setOffer(data);
      setExpandedStep(data.currentStep);
    }
    setLoading(false);
  };

  useEffect(() => { loadOffer(); }, [params.id]);

  const completeAction = async (actionId: string) => {
    setCompletingAction(actionId);
    await fetch(`/api/offers/${params.id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, status: "completed" }),
    });
    await loadOffer();
    setCompletingAction(null);
  };

  const rejectOffer = async () => {
    if (!rejectionReason.trim()) return;
    await fetch(`/api/offers/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected", rejectionReason }),
    });
    router.push("/historique");
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card h-20 animate-shimmer" />)}</div>;
  if (!offer) return <div className="text-center py-16 text-gray-400">Offre introuvable</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="mt-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{offer.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{offer.description || "Pas de description"}</p>
          <div className="flex items-center gap-3 mt-3">
            {offer.category && (
              <span className="badge" style={{ backgroundColor: `${offer.category.color}15`, color: offer.category.color, border: `1px solid ${offer.category.color}30` }}>{offer.category.name}</span>
            )}
            <span className={`badge ${offer.status === "in_progress" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : offer.status === "validated" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {offer.status === "in_progress" ? "En cours" : offer.status === "validated" ? "Validée" : "Rejetée"}
            </span>
          </div>
        </div>
        {offer.status === "in_progress" && (
          <button onClick={() => setShowRejectModal(true)} className="btn-danger flex items-center gap-2">
            <X className="w-4 h-4" /> Rejeter
          </button>
        )}
      </div>

      {/* Global progress */}
      <div className="glass-card-static">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Progression globale</span>
          <span className="text-2xl font-bold text-white">{offer.progressPercent}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-cyan-500 to-emerald-500 progress-bar-fill" style={{ width: `${offer.progressPercent}%` }} />
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="space-y-3">
        {offer.steps?.map((step: any) => {
          const isExpanded = expandedStep === step.stepNumber;
          const isCompleted = step.status === "completed";
          const isInProgress = step.status === "in_progress";
          const isPending = step.status === "pending";
          const completedActions = step.actions?.filter((a: any) => a.status === "completed").length || 0;
          const totalActions = step.actions?.length || 0;
          const slaExceeded = step.slaWeeks && step.startedAt && !step.completedAt && (Date.now() - new Date(step.startedAt).getTime()) > step.slaWeeks * 7 * 24 * 60 * 60 * 1000;

          return (
            <div key={step.id} className={`rounded-2xl border overflow-hidden transition-all ${isCompleted ? "border-green-500/20 bg-green-500/[0.03]" : isInProgress ? "border-brand-500/20 bg-brand-500/[0.03]" : "border-white/[0.06] bg-white/[0.01]"}`}>
              {/* Step Header */}
              <button onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)} className="w-full flex items-center gap-4 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-green-500/20" : isInProgress ? "bg-brand-500/20" : "bg-white/5"}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : isInProgress ? <Clock className="w-5 h-5 text-brand-400 animate-pulse" /> : <Circle className="w-5 h-5 text-gray-600" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Étape {step.stepNumber} — {step.stepName}</span>
                    {slaExceeded && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>R: {step.responsibleRole}</span>
                    <span>{completedActions}/{totalActions} actions</span>
                    {step.completedAt && <span className="text-green-400">Terminé le {new Date(step.completedAt).toLocaleDateString("fr-FR")}</span>}
                    {slaExceeded && <span className="text-amber-400">⚠ SLA dépassé ({step.slaWeeks} sem.)</span>}
                  </div>
                </div>
                {totalActions > 0 && (
                  <div className="w-20 h-1.5 rounded-full bg-white/[0.05] overflow-hidden mr-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${step.progressPercent}%`, backgroundColor: isCompleted ? "#10b981" : "#2563eb" }} />
                  </div>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {/* Actions */}
              {isExpanded && step.actions && (
                <div className="px-5 pb-5 space-y-2 border-t border-white/[0.04] pt-4">
                  {step.actions.map((action: any) => (
                    <div key={action.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${action.status === "completed" ? "bg-green-500/[0.05]" : action.status === "in_progress" ? "bg-brand-500/[0.05]" : "bg-white/[0.02]"}`}>
                      {action.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${action.status === "completed" ? "text-gray-400 line-through" : "text-white"}`}>{action.label}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {action.responsible}
                          {action.completedAt && ` • ${new Date(action.completedAt).toLocaleDateString("fr-FR")}`}
                        </p>
                      </div>
                      {action.status !== "completed" && isInProgress && (
                        <button onClick={() => completeAction(action.id)} disabled={completingAction === action.id} className="btn-primary !py-1.5 !px-3 !text-xs">
                          {completingAction === action.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Valider"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md mx-4 glass-card-static !p-0 overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Rejeter l&apos;offre</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">⚠ Cette action est irréversible. L&apos;offre sera archivée dans l&apos;historique avec le motif de rejet.</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Motif de rejet (obligatoire)</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="input-field mt-1 min-h-[100px] resize-none" placeholder="Expliquez pourquoi cette offre n'est pas retenue..." />
              </div>
              <button onClick={rejectOffer} disabled={!rejectionReason.trim()} className="w-full btn-danger disabled:opacity-50">Confirmer le rejet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
