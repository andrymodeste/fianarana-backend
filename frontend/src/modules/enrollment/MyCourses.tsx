import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import type { Inscription } from "../../types";
import { FiBookOpen, FiPlay, FiCheck } from "react-icons/fi";
import { photoUrl } from "../../utils/photoUrl";

export default function MyCourses() {
  const [cours, setCours] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/inscriptions/mes-cours")
      .then(r => setCours(r.data?.cours || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Mes cours</h1><p>{cours.length} cours inscrits</p></div>
      {cours.length === 0 ? (
        <div className="empty-state">
          <FiBookOpen size={48} />
          <p>Vous n'êtes inscrit à aucun cours.</p>
          <Link to="/cours" className="btn btn-primary">Découvrir les cours</Link>
        </div>
      ) : (
        <div className="my-courses-list">
          {cours.map(c => (
            <div key={c.id} className="my-course-card">
              <img src={photoUrl(c.image_url) || "/placeholder-course.jpg"} alt={c.titre} />
              <div className="my-course-info">
                <h3>{c.titre}</h3>
                <p className="my-course-prof">{c.professeur_prenom} {c.professeur_nom}</p>
                <div className="progress-wrap">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.progression || 0}%` }} />
                  </div>
                  <span>{Math.round(c.progression || 0)}%</span>
                </div>
                {c.est_termine ? <span className="badge-success"><FiCheck /> Terminé</span> : null}
              </div>
              <Link to={`/cours/${c.cours_id}/apprendre`} className="btn btn-primary btn-sm">
                <FiPlay size={14} /> Continuer
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
