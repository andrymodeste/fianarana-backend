import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { FiCheck, FiX, FiSlash } from "react-icons/fi";

interface PendingTeacher { id: number; nom: string; prenom: string; email: string; ville?: string; bio?: string; specialites?: string; diplomes?: string; experience_annees?: number; }

export default function TeacherValidation() {
  const [profs, setProfs]     = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    api.get("/admin/professeurs/en-attente").then(r => setProfs(r.data?.professeurs || [])).finally(() => setLoading(false));
  }, []);

  const validate = async (id: number, action: "valider" | "rejeter" | "suspendre") => {
    let motif = "";
    if (action === "rejeter") { motif = prompt("Motif du rejet :") || ""; }
    try {
      await api.put(`/admin/professeurs/${id}/valider`, { action, motif });
      setProfs(profs.filter(p => p.id !== id));
      setMsg(`Professeur ${action === "valider" ? "validé" : action === "rejeter" ? "rejeté" : "suspendu"} !`);
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Validation des professeurs</h1><p>{profs.length} en attente</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading ? <div className="spinner" /> : profs.length === 0 ? (
        <div className="empty-state"><FiCheck size={48} /><p>Aucun professeur en attente.</p></div>
      ) : (
        <div className="validation-list">
          {profs.map(p => (
            <div key={p.id} className="validation-card">
              <div className="validation-info">
                <h3>{p.prenom} {p.nom}</h3>
                <p>{p.email} {p.ville ? `• ${p.ville}` : ""}</p>
                {p.specialites && <p><strong>Spécialités :</strong> {p.specialites}</p>}
                {p.diplomes    && <p><strong>Diplômes :</strong> {p.diplomes}</p>}
                {p.bio         && <p className="desc-preview">{p.bio}</p>}
                {p.experience_annees !== undefined && <p>{p.experience_annees} ans d'expérience</p>}
              </div>
              <div className="validation-actions">
                <button className="btn btn-sm btn-success" onClick={() => validate(p.id, "valider")}><FiCheck /> Valider</button>
                <button className="btn btn-sm btn-danger"  onClick={() => validate(p.id, "rejeter")}><FiX /> Rejeter</button>
                <button className="btn btn-sm btn-outline" onClick={() => validate(p.id, "suspendre")}><FiSlash /> Suspendre</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
