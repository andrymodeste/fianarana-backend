import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { FiCheck, FiX, FiEye, FiBookOpen } from "react-icons/fi";

interface PendingCourse { id: number; titre: string; professeur_nom: string; professeur_prenom: string; matiere_nom: string; niveau_nom: string; cree_le: string; description: string; }
interface PendingLesson { id: number; titre: string; description: string; cours_titre: string; professeur_nom: string; professeur_prenom: string; cree_le: string; }

export default function CourseValidation() {
  const [cours, setCours]     = useState<PendingCourse[]>([]);
  const [lecons, setLecons]   = useState<PendingLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");
  const [tab, setTab]         = useState<"cours" | "lecons">("cours");

  useEffect(() => {
    Promise.all([
      api.get("/admin/cours/en-attente"),
      api.get("/admin/lecons/en-attente"),
    ]).then(([coursRes, leconsRes]) => {
      setCours(coursRes.data?.cours || []);
      setLecons(leconsRes.data?.lecons || []);
    }).finally(() => setLoading(false));
  }, []);

  const validateCourse = async (id: number, action: "valider" | "rejeter") => {
    let motif = "";
    if (action === "rejeter") { motif = prompt("Motif du rejet :") || ""; }
    try {
      await api.put(`/admin/cours/${id}/valider`, { action, motif });
      setCours(cours.filter(c => c.id !== id));
      setMsg(`Cours ${action === "valider" ? "validé" : "rejeté"} !`);
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  const validateLesson = async (id: number, action: "valider" | "rejeter") => {
    let motif = "";
    if (action === "rejeter") { motif = prompt("Motif du rejet :") || ""; }
    try {
      await api.put(`/admin/lecons/${id}/valider`, { action, motif });
      setLecons(lecons.filter(l => l.id !== id));
      setMsg(`Leçon ${action === "valider" ? "validée" : "rejetée"} !`);
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Validation des contenus</h1>
        <p>{cours.length} cours et {lecons.length} leçons en attente</p>
      </div>

      <div className="tabs" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button className={`btn ${tab === "cours" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("cours")}>
          Cours ({cours.length})
        </button>
        <button className={`btn ${tab === "lecons" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("lecons")}>
          Leçons ({lecons.length})
        </button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {loading ? <div className="spinner" /> : tab === "cours" ? (
        cours.length === 0 ? (
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
                  <button className="btn btn-sm btn-success" onClick={() => validateCourse(c.id, "valider")}><FiCheck /> Valider</button>
                  <button className="btn btn-sm btn-danger" onClick={() => validateCourse(c.id, "rejeter")}><FiX /> Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        lecons.length === 0 ? (
          <div className="empty-state"><FiBookOpen size={48} /><p>Aucune leçon en attente de validation.</p></div>
        ) : (
          <div className="validation-list">
            {lecons.map(l => (
              <div key={l.id} className="validation-card">
                <div className="validation-info">
                  <h3>{l.titre}</h3>
                  <p>Cours : {l.cours_titre} • Par {l.professeur_prenom} {l.professeur_nom}</p>
                  {l.description && <p className="desc-preview">{l.description}</p>}
                  <p className="val-date">Ajoutée le {new Date(l.cree_le).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="validation-actions">
                  <button className="btn btn-sm btn-success" onClick={() => validateLesson(l.id, "valider")}><FiCheck /> Valider</button>
                  <button className="btn btn-sm btn-danger" onClick={() => validateLesson(l.id, "rejeter")}><FiX /> Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
