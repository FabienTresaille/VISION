"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, Loader2, Plus, Target, DollarSign, Users } from "lucide-react";

export default function DetectionPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rss/articles?limit=50")
      .then((r) => r.json())
      .then((data) => setArticles((data.articles || []).filter((a: any) => a.aiOfferDraft)))
      .finally(() => setLoading(false));
  }, []);

  const createOffer = async (article: any) => {
    setCreatingId(article.id);
    const draft = JSON.parse(article.aiOfferDraft);
    try {
      await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.offerName || article.title,
          description: draft.description,
          categoryId: article.feed?.category?.id,
          sourceArticleId: article.id,
        }),
      });
      // Remove from list
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
    } finally {
      setCreatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-48 animate-shimmer" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-white">Détection d&apos;Offres</h2>
        <p className="text-sm text-gray-500 mt-1">Idées d&apos;offres packagées générées par l&apos;IA à partir de la veille</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Aucune idée d&apos;offre générée</p>
          <p className="text-gray-600 text-sm mt-2">Allez dans la Veille et cliquez &quot;Générer offre&quot; sur un article</p>
        </div>
      ) : (
        <div className="space-y-5">
          {articles.map((article: any) => {
            let draft: any = {};
            try { draft = JSON.parse(article.aiOfferDraft); } catch {}
            return (
              <div key={article.id} className="glass-card">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{draft.offerName || "Offre sans nom"}</h3>
                        <p className="text-xs text-gray-500">Source: {article.title}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{draft.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Users className="w-3 h-3" /> Cible
                        </div>
                        <p className="text-sm text-gray-300">{draft.targetClients || "—"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <DollarSign className="w-3 h-3" /> Modèle
                        </div>
                        <p className="text-sm text-gray-300">{draft.recurringModel || "—"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Target className="w-3 h-3" /> Prix indicatif
                        </div>
                        <p className="text-sm text-gray-300">{draft.estimatedPrice || "—"}</p>
                      </div>
                    </div>

                    {draft.keyBenefits && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {draft.keyBenefits.map((b: string, i: number) => (
                          <span key={i} className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">✓ {b}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => createOffer(article)}
                    disabled={creatingId === article.id}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    {creatingId === article.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Créer l&apos;offre
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
