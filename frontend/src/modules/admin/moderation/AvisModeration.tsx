import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";

interface Avis { id: number; eleve_id: number; nom: string; prenom: string; cours_titre: string; note: number; commentaire: string; est_visible: number; cree_le: string; }

export default function AvisModeration() {
  const [avis, setAvis]       = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    api.get("/admin/avis").then(r => setAvis(r.data?.avis || [])).finally(() => setLoading(false));
  }, []);

  const toggle = async (id: number, visible: number) => {
    await api.put(`/admin/avis/${id}/${visible ? "masquer" : "afficher"}`);
    setAvis(avis.map(a => a.id === id ? { ...a, est_visible: visible ? 0 : 1 } : a));
    setMsg(`Avis ${visible ? "masqué" : "affiché"} !`);
    setTimeout(() => setMsg(""), 2000);
  };

  const del = async (id: number) => {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    await api.delete(`/admin/avis/${id}`);
    setAvis(avis.filter(a => a.id !== id));
    setMsg("Avis supprimé");
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Modération des avis</h1><p>{avis.length} avis</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Élève</th><th>Cours</th><th>Note</th><th>Commentaire</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{avis.map(a => (
              <tr key={a.id} className={!a.est_visible ? "row-hidden" : ""}>
                <td>{a.prenom} {a.nom}</td>
                <td>{a.cours_titre}</td>
                <td>{"⭐".repeat(a.note)}</td>
                <td className="comment-cell">{a.commentaire || "-"}</td>
                <td><span className={a.est_visible ? "badge-success" : "badge-error"}>{a.est_visible ? "Visible" : "Masqué"}</span></td>
                <td>{new Date(a.cree_le).toLocaleDateString("fr-FR")}</td>
                <td>
                  <div className="table-actions">
                    <button title={a.est_visible ? "Masquer" : "Afficher"} className="btn btn-sm btn-outline" onClick={() => toggle(a.id, a.est_visible)}>
                      {a.est_visible ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(a.id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
