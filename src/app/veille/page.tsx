"use client";

import { useState, useEffect } from "react";
import { Rss, ExternalLink, Sparkles, Clock, Loader2, RefreshCw, Star } from "lucide-react";

export default function VeillePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory);
    params.set("limit", "50");
    const [aRes, cRes] = await Promise.all([
      fetch(`/api/rss/articles?${params}`), fetch("/api/categories"),
    ]);
    const aData = await aRes.json();
    setArticles(aData.articles || []);
    setCategories(await cRes.json());
    setLoading(false);
  };

  useEffect(() => { loadArticles(); }, [selectedCategory]);

  const triggerFetch = async () => {
    setFetching(true);
    await fetch("/api/rss/fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selectedCategory ? { categoryId: selectedCategory } : {}) });
    await loadArticles();
    setFetching(false);
  };

  const generateOffer = async (articleId: string) => {
    setGeneratingId(articleId);
    await fetch("/api/ai/generate-offer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ articleId }) });
    await loadArticles();
    setGeneratingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Flux RSS & Veille</h2>
          <p className="text-sm text-gray-500 mt-1">Articles classés par catégorie avec analyse IA</p>
        </div>
        <button onClick={triggerFetch} disabled={fetching} className="btn-primary flex items-center gap-2">
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {fetching ? "Ingestion..." : "Actualiser les flux"}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/[0.06]"}`}>Toutes</button>
        {categories.map((cat: any) => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === cat.id ? "text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/[0.06]"}`} style={selectedCategory === cat.id ? { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}40`, color: cat.color } : {}}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
            <span className="text-xs opacity-60">{cat._count?.articleTags || 0}</span>
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-64 animate-shimmer" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <Rss className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Aucun article pour le moment</p>
          <p className="text-gray-600 text-sm mt-2">Cliquez sur &quot;Actualiser les flux&quot; pour lancer l&apos;ingestion</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {articles.map((article: any) => (
            <div key={article.id} className="glass-card flex flex-col">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {article.tags?.map((tag: any, i: number) => (
                  <span key={i} className="badge" style={{ backgroundColor: `${tag.category?.color || "#2563eb"}15`, color: tag.category?.color || "#2563eb", border: `1px solid ${tag.category?.color || "#2563eb"}30` }}>
                    {tag.subCategory?.name || tag.category?.name}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-3 mb-4 flex-1">{article.summary || article.aiAnalysis || "Pas de résumé"}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-600 mb-4">
                <span className="flex items-center gap-1"><Rss className="w-3 h-3" />{article.feed?.name}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>
              </div>
              {article.relevanceScore !== null && (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${(article.relevanceScore || 0) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-amber-400 font-medium">{Math.round((article.relevanceScore || 0) * 100)}%</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 !px-3 !text-xs flex items-center gap-1.5 flex-1 justify-center">
                  <ExternalLink className="w-3 h-3" />Lire
                </a>
                {!article.offerGenerated ? (
                  <button onClick={() => generateOffer(article.id)} disabled={generatingId === article.id} className="btn-primary !py-2 !px-3 !text-xs flex items-center gap-1.5 flex-1 justify-center">
                    {generatingId === article.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Générer offre
                  </button>
                ) : (
                  <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 flex-1 justify-center !py-2">✓ Offre générée</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
