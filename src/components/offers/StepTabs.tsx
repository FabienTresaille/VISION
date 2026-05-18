"use client";

import { useState } from "react";
import { MessageSquare, Paperclip, Users, Plus, Trash2, Download, Send, UserPlus, X, Upload } from "lucide-react";

// ─── Comments Tab ────────────────────────────────────────────
export function CommentsTab({ stepId, comments, offerId, onRefresh }: { stepId: string; comments: any[]; offerId: string; onRefresh: () => void }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const addComment = async () => {
    if (!author.trim() || !content.trim()) return;
    setSending(true);
    await fetch(`/api/offers/${offerId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, author, content }),
    });
    setContent("");
    setSending(false);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {comments.length === 0 && <p className="text-xs text-gray-600 italic">Aucun commentaire</p>}
      {comments.map((c: any) => (
        <div key={c.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-400">{c.author}</span>
            <span className="text-[10px] text-gray-600">{new Date(c.createdAt).toLocaleString("fr-FR")}</span>
          </div>
          <p className="text-sm text-gray-300">{c.content}</p>
        </div>
      ))}
      <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nom" className="input-field !py-1.5 !text-xs w-28" />
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre commentaire..." className="input-field !py-1.5 !text-xs flex-1" onKeyDown={(e) => e.key === "Enter" && addComment()} />
        <button onClick={addComment} disabled={sending || !author.trim() || !content.trim()} className="btn-primary !py-1.5 !px-3 !text-xs disabled:opacity-50">
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Attachments Tab ─────────────────────────────────────────
export function AttachmentsTab({ stepId, attachments, offerId, onRefresh }: { stepId: string; attachments: any[]; offerId: string; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert("Le fichier dépasse 50 Mo");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("stepId", stepId);
    fd.append("uploadedBy", "Utilisateur");
    await fetch(`/api/offers/${offerId}/attachments`, { method: "POST", body: fd });
    setUploading(false);
    onRefresh();
  };

  const deleteAttachment = async (id: string) => {
    if (!confirm("Supprimer cette pièce jointe ?")) return;
    await fetch(`/api/offers/${offerId}/attachments?attachmentId=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-3">
      {attachments.length === 0 && <p className="text-xs text-gray-600 italic">Aucune pièce jointe</p>}
      {attachments.map((a: any) => (
        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{a.fileName}</p>
            <p className="text-[10px] text-gray-600">{formatSize(a.fileSize)} • {a.uploadedBy} • {new Date(a.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <a href={`/api/offers/${offerId}/attachments?attachmentId=${a.id}`} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Télécharger">
            <Download className="w-3.5 h-3.5 text-brand-400" />
          </a>
          <button onClick={() => deleteAttachment(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Supprimer">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      ))}
      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-brand-500/30 cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
        <Upload className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">{uploading ? "Upload en cours..." : "Ajouter un fichier (max 50 Mo)"}</span>
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} disabled={uploading} />
      </label>
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────
export function MembersTab({ stepId, members, offerId, onRefresh }: { stepId: string; members: any[]; offerId: string; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"responsible" | "stakeholder">("responsible");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const addMember = async () => {
    if (!name.trim()) return;
    setAdding(true);
    await fetch(`/api/offers/${offerId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, name, role, email: email || undefined }),
    });
    setName(""); setEmail(""); setShowAdd(false); setAdding(false);
    onRefresh();
  };

  const removeMember = async (id: string) => {
    await fetch(`/api/offers/${offerId}/members?memberId=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const responsibles = members.filter((m: any) => m.role === "responsible");
  const stakeholders = members.filter((m: any) => m.role === "stakeholder");

  return (
    <div className="space-y-3">
      {responsibles.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Responsables</p>
          {responsibles.map((m: any) => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-brand-500/[0.05] border border-brand-500/10 mb-1">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center"><Users className="w-3 h-3 text-brand-400" /></div>
              <span className="text-sm text-white flex-1">{m.name}</span>
              {m.email && <span className="text-[10px] text-gray-500">{m.email}</span>}
              <button onClick={() => removeMember(m.id)} className="p-1 rounded hover:bg-red-500/10"><X className="w-3 h-3 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
      {stakeholders.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Parties prenantes</p>
          {stakeholders.map((m: any) => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-1">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center"><Users className="w-3 h-3 text-gray-500" /></div>
              <span className="text-sm text-gray-300 flex-1">{m.name}</span>
              {m.email && <span className="text-[10px] text-gray-500">{m.email}</span>}
              <button onClick={() => removeMember(m.id)} className="p-1 rounded hover:bg-red-500/10"><X className="w-3 h-3 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
      {members.length === 0 && !showAdd && <p className="text-xs text-gray-600 italic">Aucun membre assigné</p>}
      {showAdd ? (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="input-field !py-1.5 !text-xs flex-1" />
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="input-field !py-1.5 !text-xs w-36">
              <option value="responsible">Responsable</option>
              <option value="stakeholder">Partie prenante</option>
            </select>
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optionnel)" className="input-field !py-1.5 !text-xs" />
          <div className="flex gap-2">
            <button onClick={addMember} disabled={adding || !name.trim()} className="btn-primary !py-1.5 !px-3 !text-xs disabled:opacity-50">Ajouter</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary !py-1.5 !px-3 !text-xs">Annuler</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          <UserPlus className="w-3.5 h-3.5" /> Ajouter un membre
        </button>
      )}
    </div>
  );
}

// ─── Step Tab Wrapper ────────────────────────────────────────
export function StepTabsPanel({ step, offerId, onRefresh }: { step: any; offerId: string; onRefresh: () => void }) {
  const [tab, setTab] = useState<"comments" | "attachments" | "members">("members");
  const tabs = [
    { key: "members" as const, label: "Membres", icon: Users, count: step.members?.length || 0 },
    { key: "comments" as const, label: "Commentaires", icon: MessageSquare, count: step.comments?.length || 0 },
    { key: "attachments" as const, label: "Documents", icon: Paperclip, count: step.attachments?.length || 0 },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.04]">
      <div className="flex items-center gap-1 mb-3">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${tab === t.key ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/5 text-[10px]">{t.count}</span>}
          </button>
        ))}
      </div>
      {tab === "comments" && <CommentsTab stepId={step.id} comments={step.comments || []} offerId={offerId} onRefresh={onRefresh} />}
      {tab === "attachments" && <AttachmentsTab stepId={step.id} attachments={step.attachments || []} offerId={offerId} onRefresh={onRefresh} />}
      {tab === "members" && <MembersTab stepId={step.id} members={step.members || []} offerId={offerId} onRefresh={onRefresh} />}
    </div>
  );
}
