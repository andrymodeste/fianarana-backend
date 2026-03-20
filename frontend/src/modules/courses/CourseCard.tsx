import { Link } from "react-router-dom";
import { FiStar, FiUsers, FiClock, FiLock } from "react-icons/fi";
import type { Cours } from "../../types";

interface Props { cours: Cours; }

export default function CourseCard({ cours }: Props) {
  return (
    <Link to={`/cours/${cours.id}`} className="course-card">
      <div className="course-thumb">
        <img src={cours.image_url || "/placeholder-course.jpg"} alt={cours.titre} />
        {cours.est_premium ? (
          <span className="badge-premium"><FiLock size={10} /> Premium</span>
        ) : (
          <span className="badge-free">Gratuit</span>
        )}
        {cours.langue && <span className="badge-lang">{cours.langue.toUpperCase()}</span>}
      </div>
      <div className="course-body">
        {cours.matiere_nom && (
          <span className="course-matiere" style={{ background: cours.matiere_couleur || "var(--purple)" }}>
            {cours.matiere_nom}
          </span>
        )}
        <h3 className="course-titre">{cours.titre}</h3>
        <p className="course-prof">
          {cours.professeur_prenom} {cours.professeur_nom}
        </p>
        <div className="course-meta">
          <span><FiStar size={13} /> {parseFloat(String(cours.note_moyenne || 0)).toFixed(1)}</span>
          <span><FiUsers size={13} /> {cours.nb_inscrits || 0}</span>
          {cours.duree_totale_minutes ? <span><FiClock size={13} /> {cours.duree_totale_minutes} min</span> : null}
        </div>
        <div className="course-price">
          {cours.est_premium ? (
            <span className="price">{cours.prix?.toLocaleString()} Ar</span>
          ) : (
            <span className="price-free">Gratuit</span>
          )}
        </div>
      </div>
    </Link>
  );
}
