import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { FiCheck, FiX, FiEye } from "react-icons/fi";

interface PendingCourse { id: number; titre: string; professeur_nom: string; professeur_prenom: string; matiere_nom: string; niveau_nom: string; cree_le: string; description: string; }

export default function CourseValidation() {
  const [cours, setCours]     = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    api.get("/admin/cours/en-attente").then(r => setCours(r.data?.cours || [])).finally(() => setLoading(false));
  }, []);

  const validate = async (id: number, action: "valider" | "rejeter") => {
    let motif = "";
    if (action === "rejeter") { motif = prompt("Motif du rejet :") || ""; }
    try {
      await api.put(`/admin/cours/${id}/valider`, { action, motif });
      setCours(cours.filter(c => c.id !== id));
      setMsg(`Cours ${action === "valider" ? "validé" : "rejeté"} !`);
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Validation des cours</h1><p>{cours.length} cours en attente</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading ? <div className="spinner" /> : cours.length === 0 ? (
        <div className="empty-state"><FiCheck size={48} /><p>Aucun cours en attente de validation.</p></div>
      ) : (
        <div className="validation-list">
          {cours.map(c => (
            <div key={c.id} className="validation-card">
              <div className="validation-info">
                <h3>{c.titre}</h3>
                <p>Par {c.professeur_prenom} {c.professeur_nom} • {c.matiere_nom} • {c.niveau_nom}</p>
                <p className="desc-preview">{c.description}</p>
                <p className="val-date">Soumis le {new Date(c.cree_le).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="validation-actions">
                <a href={`/cours/${c.id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost"><FiEye /> Voir</a>
                <button className="btn btn-sm btn-success" onClick={() => validate(c.id, "valider")}><FiCheck /> Valider</button>
                <button className="btn btn-sm btn-danger" onClick={() => validate(c.id, "rejeter")}><FiX /> Rejeter</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
