"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle, Loader2, X, ChevronDown, ChevronUp, Shield, Calendar, Tag, RefreshCw, GitBranch, Plus, MessageSquare, Paperclip, Users } from "lucide-react";
import { StepTabsPanel } from "@/components/offers/StepTabs";
import { ActionTabsPanel } from "@/components/offers/ActionTabs";

const STEP_NAMES = ["Détection", "Analyse (Go/NoGo)", "CDC & Maquettage", "Création offre commerciale", "Validation (Gatekeeper)", "Commercialisation", "Suivi"];

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completingAction, setCompletingAction] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [resuming, setResuming] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);

  const loadOffer = async () => {
    const res = await fetch(`/api/offers/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setOffer(data);
      if (expandedStep === null) setExpandedStep(data.currentStep);
    }
    setLoading(false);
  };

  useEffect(() => { loadOffer(); }, [params.id]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

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

  const updateDueDate = async (actionId: string, currentStatus: string, dateStr: string) => {
    await fetch(`/api/offers/${params.id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, status: currentStatus, dueDate: dateStr }),
    });
    await loadOffer();
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

  const resumeOffer = async () => {
    if (!confirm("Créer une nouvelle version de cette offre ? L'offre actuelle restera dans l'historique.")) return;
    setResuming(true);
    const res = await fetch(`/api/offers/${params.id}/resume`, { method: "POST" });
    if (res.ok) {
      const newOffer = await res.json();
      router.push(`/offres/${newOffer.id}`);
    }
    setResuming(false);
  };

  const addTag = async (categoryId: string, subCategoryId?: string) => {
    await fetch(`/api/offers/${params.id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, subCategoryId }),
    });
    setShowTagSelector(false);
    await loadOffer();
  };

  const removeTag = async (tagId: string) => {
    await fetch(`/api/offers/${params.id}/tags?tagId=${tagId}`, { method: "DELETE" });
    await loadOffer();
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">{offer.name}</h2>
            {offer.version > 1 && (
              <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">V{offer.version}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{offer.description || "Pas de description"}</p>

          {/* Version info */}
          {offer.parentOffer && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Issue de</span>
              <a href={`/offres/${offer.parentOffer.id}`} className="text-brand-400 hover:text-brand-300 transition-colors">
                {offer.parentOffer.name}
              </a>
            </div>
          )}
          {offer.childOffers?.length > 0 && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Versions suivantes :</span>
              {offer.childOffers.map((c: any) => (
                <a key={c.id} href={`/offres/${c.id}`} className="text-brand-400 hover:text-brand-300 transition-colors">
                  V{c.version} ({c.status === "in_progress" ? "en cours" : c.status === "validated" ? "validée" : "rejetée"})
                </a>
              ))}
            </div>
          )}

          {/* Status + Category badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {offer.category && (
              <span className="badge" style={{ backgroundColor: `${offer.category.color}15`, color: offer.category.color, border: `1px solid ${offer.category.color}30` }}>{offer.category.name}</span>
            )}
            <span className={`badge ${offer.status === "in_progress" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : offer.status === "validated" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {offer.status === "in_progress" ? "En cours" : offer.status === "validated" ? "Validée" : "Rejetée"}
            </span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-gray-600" />
            {offer.offerTags?.map((t: any) => (
              <span key={t.id} className="inline-flex items-center gap-1 badge text-xs" style={{ backgroundColor: `${t.category.color}10`, color: t.category.color, border: `1px solid ${t.category.color}25` }}>
                {t.subCategory ? t.subCategory.name : t.category.name}
                <button onClick={() => removeTag(t.id)} className="hover:text-red-400 transition-colors ml-0.5"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
            <div className="relative">
              <button onClick={() => setShowTagSelector(!showTagSelector)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-brand-400 transition-colors px-2 py-1 rounded-lg border border-dashed border-white/[0.08] hover:border-brand-500/30">
                <Plus className="w-3 h-3" /> Tag
              </button>
              {showTagSelector && (
                <div className="absolute top-full left-0 mt-1 z-30 w-64 max-h-72 overflow-auto rounded-xl bg-surface-2 border border-white/[0.08] shadow-xl p-2">
                  {categories.map((cat: any) => (
                    <div key={cat.id}>
                      <button onClick={() => addTag(cat.id)} className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-white/5 font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} /> {cat.name}
                      </button>
                      {cat.subCategories?.map((sub: any) => (
                        <button key={sub.id} onClick={() => addTag(cat.id, sub.id)} className="w-full text-left px-6 py-1.5 rounded-lg text-[11px] text-gray-400 hover:bg-white/5 hover:text-white">
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  ))}
                  <button onClick={() => setShowTagSelector(false)} className="w-full text-center text-[10px] text-gray-600 py-1 mt-1">Fermer</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {offer.status === "rejected" && (
            <button onClick={resumeOffer} disabled={resuming} className="btn-primary flex items-center gap-2">
              {resuming ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Reprendre
            </button>
          )}
          {offer.status === "in_progress" && (
            <button onClick={() => setShowRejectModal(true)} className="btn-danger flex items-center gap-2">
              <X className="w-4 h-4" /> Rejeter
            </button>
          )}
        </div>
      </div>

      {/* Rejection info */}
      {offer.status === "rejected" && offer.rejectionReason && (
        <div className="p-4 rounded-2xl bg-red-500/[0.05] border border-red-500/15">
          <p className="text-xs text-red-400 font-medium mb-1">Motif de rejet{offer.rejectedAt && ` — ${new Date(offer.rejectedAt).toLocaleDateString("fr-FR")}`}</p>
          <p className="text-sm text-gray-300">{offer.rejectionReason}</p>
        </div>
      )}

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
          const completedActions = step.actions?.filter((a: any) => a.status === "completed").length || 0;
          const totalActions = step.actions?.length || 0;
          const commentCount = step.comments?.length || 0;
          const attachmentCount = step.attachments?.length || 0;
          const memberCount = step.members?.length || 0;
          const slaExceeded = step.slaWeeks && step.startedAt && !step.completedAt && (Date.now() - new Date(step.startedAt).getTime()) > step.slaWeeks * 7 * 24 * 60 * 60 * 1000;

          return (
            <div key={step.id} className={`rounded-2xl border overflow-hidden transition-all ${isCompleted ? "border-green-500/20 bg-green-500/[0.03]" : isInProgress ? "border-brand-500/20 bg-brand-500/[0.03]" : "border-white/[0.06] bg-white/[0.01]"}`}>
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
                    {commentCount > 0 && <span>💬 {commentCount}</span>}
                    {attachmentCount > 0 && <span>📎 {attachmentCount}</span>}
                    {memberCount > 0 && <span>👥 {memberCount}</span>}
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

              {isExpanded && (
                <div className="px-5 pb-5">
                  {/* Actions */}
                  {step.actions && (
                    <div className="space-y-2 border-t border-white/[0.04] pt-4">
                      {step.actions.map((action: any) => {
                        const actionCommentCount = action.comments?.length || 0;
                        const actionAttachmentCount = action.attachments?.length || 0;
                        const actionMemberCount = action.members?.length || 0;
                        const actionResponsible = action.members?.find((m: any) => m.role === "responsible");
                        const isActionExpanded = expandedAction === action.id;
                        const hasDeliverables = actionCommentCount > 0 || actionAttachmentCount > 0 || actionMemberCount > 0;

                        return (
                          <div key={action.id}>
                            <div className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:ring-1 hover:ring-white/[0.08] ${action.status === "completed" ? "bg-green-500/[0.05]" : action.status === "in_progress" ? "bg-brand-500/[0.05]" : "bg-white/[0.02]"} ${isActionExpanded ? "ring-1 ring-brand-500/20" : ""}`}
                              onClick={() => setExpandedAction(isActionExpanded ? null : action.id)}
                            >
                              {action.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm ${action.status === "completed" ? "text-gray-400 line-through" : "text-white"}`}>{action.label}</p>
                                  {/* Deliverable indicators */}
                                  {hasDeliverables && (
                                    <div className="flex items-center gap-1.5">
                                      {actionCommentCount > 0 && (
                                        <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                          <MessageSquare className="w-2.5 h-2.5" />{actionCommentCount}
                                        </span>
                                      )}
                                      {actionAttachmentCount > 0 && (
                                        <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                          <Paperclip className="w-2.5 h-2.5" />{actionAttachmentCount}
                                        </span>
                                      )}
                                      {actionMemberCount > 0 && (
                                        <span className="flex items-center gap-0.5 text-[9px] text-gray-500">
                                          <Users className="w-2.5 h-2.5" />{actionMemberCount}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-[11px] text-gray-600">
                                    {actionResponsible ? (
                                      <span className="inline-flex items-center gap-1">
                                        <Shield className="w-2.5 h-2.5 text-brand-400" />
                                        <span className="text-brand-400/80">{actionResponsible.name}</span>
                                      </span>
                                    ) : (
                                      action.responsible
                                    )}
                                    {action.completedAt && ` • Terminé le ${new Date(action.completedAt).toLocaleDateString("fr-FR")}`}
                                  </p>
                                  {action.status !== "completed" && (
                                    <div className="flex items-center gap-1 group/date relative" onClick={(e) => e.stopPropagation()}>
                                      <Calendar className="w-3 h-3 text-gray-500 group-hover/date:text-brand-400 transition-colors" />
                                      <input type="date" value={action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => updateDueDate(action.id, action.status, e.target.value)} className="bg-transparent text-[11px] text-gray-500 hover:text-brand-400 focus:outline-none cursor-pointer" title="Date d'échéance" />
                                    </div>
                                  )}
                                  {action.status === "completed" && action.dueDate && (
                                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> Échéance: {new Date(action.dueDate).toLocaleDateString("fr-FR")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {action.status !== "completed" && isInProgress && (
                                <button onClick={(e) => { e.stopPropagation(); completeAction(action.id); }} disabled={completingAction === action.id} className="btn-primary !py-1.5 !px-3 !text-xs">
                                  {completingAction === action.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Valider"}
                                </button>
                              )}
                              <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform flex-shrink-0 ${isActionExpanded ? "rotate-180" : ""}`} />
                            </div>

                            {/* Action deliverables panel */}
                            {isActionExpanded && (
                              <ActionTabsPanel action={action} offerId={offer.id} onRefresh={loadOffer} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tabs: Members, Comments, Attachments */}
                  <StepTabsPanel step={step} offerId={offer.id} onRefresh={loadOffer} />
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
                <p className="text-xs text-red-400">⚠ L&apos;offre sera archivée. Vous pourrez la reprendre plus tard via le bouton &quot;Reprendre&quot;.</p>
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
