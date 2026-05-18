"use client";

import { useState } from "react";
import { MessageSquare, Paperclip, Users, Send, Upload, Download, Trash2, X, UserPlus, Shield, ChevronDown } from "lucide-react";

// ─── Action Comments ─────────────────────────────────────────
function ActionCommentsTab({ actionId, comments, offerId, onRefresh }: { actionId: string; comments: any[]; offerId: string; onRefresh: () => void }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const addComment = async () => {
    if (!author.trim() || !content.trim()) return;
    setSending(true);
    await fetch(`/api/offers/${offerId}/actions/${actionId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    });
    setContent("");
    setSending(false);
    onRefresh();
  };

  return (
    <div className="space-y-2">
      {comments.length === 0 && <p className="text-[10px] text-gray-600 italic">Aucun commentaire</p>}
      {comments.map((c: any) => (
        <div key={c.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-brand-400">{c.author}</span>
            <span className="text-[9px] text-gray-600">{new Date(c.createdAt).toLocaleString("fr-FR")}</span>
          </div>
          <p className="text-xs text-gray-300">{c.content}</p>
        </div>
      ))}
      <div className="flex gap-1.5 pt-1.5">
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nom" className="input-field !py-1 !px-2 !text-[11px] w-24" />
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Commentaire..." className="input-field !py-1 !px-2 !text-[11px] flex-1" onKeyDown={(e) => e.key === "Enter" && addComment()} />
        <button onClick={addComment} disabled={sending || !author.trim() || !content.trim()} className="btn-primary !py-1 !px-2 !text-[10px] disabled:opacity-50">
          <Send className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Action Attachments ──────────────────────────────────────
function ActionAttachmentsTab({ actionId, attachments, offerId, onRefresh }: { actionId: string; attachments: any[]; offerId: string; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert("Le fichier dépasse 50 Mo");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("uploadedBy", "Utilisateur");
    await fetch(`/api/offers/${offerId}/actions/${actionId}/attachments`, { method: "POST", body: fd });
    setUploading(false);
    onRefresh();
  };

  const deleteAttachment = async (id: string) => {
    if (!confirm("Supprimer cette pièce jointe ?")) return;
    await fetch(`/api/offers/${offerId}/actions/${actionId}/attachments?attachmentId=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-2">
      {attachments.length === 0 && <p className="text-[10px] text-gray-600 italic">Aucun document</p>}
      {attachments.map((a: any) => (
        <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Paperclip className="w-3 h-3 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{a.fileName}</p>
            <p className="text-[9px] text-gray-600">{formatSize(a.fileSize)} • {a.uploadedBy} • {new Date(a.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <a href={`/api/offers/${offerId}/actions/${actionId}/attachments?attachmentId=${a.id}`} className="p-1 rounded hover:bg-white/5 transition-colors" title="Télécharger">
            <Download className="w-3 h-3 text-brand-400" />
          </a>
          <button onClick={() => deleteAttachment(a.id)} className="p-1 rounded hover:bg-red-500/10 transition-colors" title="Supprimer">
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      ))}
      <label className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-white/[0.08] hover:border-brand-500/30 cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
        <Upload className="w-3 h-3 text-gray-500" />
        <span className="text-[10px] text-gray-500">{uploading ? "Upload..." : "Ajouter un fichier (max 50 Mo)"}</span>
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} disabled={uploading} />
      </label>
    </div>
  );
}

// ─── Action Team (1 Responsible + N Members) ─────────────────
function ActionTeamTab({ actionId, members, offerId, onRefresh }: { actionId: string; members: any[]; offerId: string; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"responsible" | "member">("member");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const responsible = members.find((m: any) => m.role === "responsible");
  const teamMembers = members.filter((m: any) => m.role === "member");

  const addMember = async () => {
    if (!name.trim()) return;
    setAdding(true);
    await fetch(`/api/offers/${offerId}/actions/${actionId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, email: email || undefined }),
    });
    setName(""); setEmail(""); setShowAdd(false); setAdding(false);
    onRefresh();
  };

  const removeMember = async (id: string) => {
    await fetch(`/api/offers/${offerId}/actions/${actionId}/members?memberId=${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-2">
      {/* Responsible section */}
      <div>
        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Responsable</p>
        {responsible ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-500/[0.07] border border-brand-500/15">
            <div className="w-5 h-5 rounded-full bg-brand-500/25 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-brand-400" />
            </div>
            <span className="text-xs text-white font-medium flex-1">{responsible.name}</span>
            {responsible.email && <span className="text-[9px] text-gray-500">{responsible.email}</span>}
            <button onClick={() => removeMember(responsible.id)} className="p-0.5 rounded hover:bg-red-500/10" title="Retirer">
              <X className="w-2.5 h-2.5 text-red-400" />
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-gray-600 italic">Aucun responsable assigné</p>
        )}
      </div>

      {/* Members section */}
      <div>
        <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Membres</p>
        {teamMembers.length === 0 && <p className="text-[10px] text-gray-600 italic">Aucun membre</p>}
        {teamMembers.map((m: any) => (
          <div key={m.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-1">
            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="w-2.5 h-2.5 text-gray-500" />
            </div>
            <span className="text-xs text-gray-300 flex-1">{m.name}</span>
            {m.email && <span className="text-[9px] text-gray-500">{m.email}</span>}
            <button onClick={() => removeMember(m.id)} className="p-0.5 rounded hover:bg-red-500/10">
              <X className="w-2.5 h-2.5 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd ? (
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1.5">
          <div className="flex gap-1.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="input-field !py-1 !px-2 !text-[11px] flex-1" />
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="input-field !py-1 !px-2 !text-[11px] w-32">
              <option value="responsible">Responsable</option>
              <option value="member">Membre</option>
            </select>
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optionnel)" className="input-field !py-1 !px-2 !text-[11px]" />
          <div className="flex gap-1.5">
            <button onClick={addMember} disabled={adding || !name.trim()} className="btn-primary !py-1 !px-2 !text-[10px] disabled:opacity-50">Ajouter</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary !py-1 !px-2 !text-[10px]">Annuler</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 transition-colors">
          <UserPlus className="w-3 h-3" /> Ajouter
        </button>
      )}
    </div>
  );
}

// ─── Action Tabs Panel ───────────────────────────────────────
export function ActionTabsPanel({ action, offerId, onRefresh }: { action: any; offerId: string; onRefresh: () => void }) {
  const [tab, setTab] = useState<"comments" | "attachments" | "team">("comments");

  const commentCount = action.comments?.length || 0;
  const attachmentCount = action.attachments?.length || 0;
  const memberCount = action.members?.length || 0;

  const tabs = [
    { key: "comments" as const, label: "Commentaires", icon: MessageSquare, count: commentCount },
    { key: "attachments" as const, label: "Documents", icon: Paperclip, count: attachmentCount },
    { key: "team" as const, label: "Équipe", icon: Users, count: memberCount },
  ];

  return (
    <div className="mt-2 ml-7 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-fade-in">
      <div className="flex items-center gap-1 mb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-colors ${tab === t.key ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
            <t.icon className="w-3 h-3" />
            {t.label}
            {t.count > 0 && <span className="ml-0.5 px-1 py-0.5 rounded-full bg-white/5 text-[9px]">{t.count}</span>}
          </button>
        ))}
      </div>
      {tab === "comments" && <ActionCommentsTab actionId={action.id} comments={action.comments || []} offerId={offerId} onRefresh={onRefresh} />}
      {tab === "attachments" && <ActionAttachmentsTab actionId={action.id} attachments={action.attachments || []} offerId={offerId} onRefresh={onRefresh} />}
      {tab === "team" && <ActionTeamTab actionId={action.id} members={action.members || []} offerId={offerId} onRefresh={onRefresh} />}
    </div>
  );
}
