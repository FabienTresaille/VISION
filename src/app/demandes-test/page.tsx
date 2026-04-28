"use client";

import { useState, useEffect } from "react";
import { FlaskConical, CheckCircle2, XCircle, Clock, Trash2, Mail, LayoutDashboard, HelpCircle, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface TestRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  solutionName: string;
  description: string;
  status: string;
  createdAt: string;
  offer?: {
    name: string;
  };
}

export default function DemandesTestPage() {
  const [requests, setRequests] = useState<TestRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/test-requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/test-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      toast.success("Statut mis à jour");
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" /> En attente</span>;
      case "info_requested":
        return <span className="badge badge-neutral bg-blue-500/10 text-blue-400 border border-blue-500/20"><HelpCircle className="w-3 h-3 mr-1" /> Attente infos</span>;
      case "approved":
      case "completed":
        return <span className="badge badge-success"><CheckCircle2 className="w-3 h-3 mr-1" /> Validée</span>;
      case "rejected":
        return <span className="badge badge-error"><XCircle className="w-3 h-3 mr-1" /> Rejetée</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 animate-pulse" />
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="glass-card h-64 animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Demandes de test</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Gérez les demandes de test de solutions (POC)
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="glass-card-static !p-0 overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune demande de test pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-white/[0.02] border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-4 font-medium">Solution</th>
                  <th className="px-6 py-4 font-medium">Demandeur</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{req.solutionName}</p>
                      {req.offer && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <LayoutDashboard className="w-3 h-3" />
                          Lié à: {req.offer.name}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{req.requesterName}</p>
                      <a href={`mailto:${req.requesterEmail}`} className="text-xs text-brand-400 hover:underline flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {req.requesterEmail}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 line-clamp-2 max-w-md">{req.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "pending" || req.status === "info_requested" ? (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, "approved")}
                              title="Valider"
                              className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, "info_requested")}
                              title="Demander des infos"
                              className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, "rejected")}
                              title="Rejeter"
                              className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Traitée</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
