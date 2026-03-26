import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { photoUrl } from "../utils/photoUrl";
import type { Cours, Lecon } from "../types";
import {
  FiStar,
  FiClock,
  FiUsers,
  FiAward,
  FiPlay,
  FiLock,
  FiDownload,
} from "react-icons/fi";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<Cours | null>(null);
  const [lecons, setLecons] = useState<Lecon[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api.get(`/cours/${id}`)
      .then((res) => {
        const data = res.data?.cours || res.data;
        setCourse(Array.isArray(data) ? data[0] : data);
      })
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      api.get("/inscriptions/mes-cours")
        .then((res) => {
          const mesCours = res.data?.cours || res.data || [];
          setEnrolled(mesCours.some((c: any) => c.cours_id === Number(id)));
        })
        .catch(() => {});

      api.get(`/lecons/cours/${id}`)
        .then((res) => setLecons(res.data?.lecons || []))
        .catch(() => {});
    }
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    setError("");
    try {
      await api.post("/inscriptions/inscrire", { cours_id: Number(id) });
      setEnrolled(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription au cours");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!course) return <div className="error-page"><p>Cours introuvable.</p></div>;

  const thumbnail = photoUrl(course.image_url) || `https://picsum.photos/seed/${course.id}/800/450`;

  const professeurNom = `${course.professeur_prenom || ""} ${course.professeur_nom || ""}`.trim();

  return (
    <div className="course-detail">
      {/* Hero */}
      <div className="course-detail-hero">
        <div className="course-detail-hero-inner">
          <div className="course-detail-info">
            <h1>{course.titre}</h1>
            <p className="course-detail-desc">{course.description}</p>
            <div className="course-meta">
              <span className="course-rating">
                <FiStar className="star filled" /> 4.5
              </span>
              <span><FiUsers /> {course.nombre_lecons} leçons</span>
              <span><FiClock /> {course.duree_totale_minutes} min</span>
            </div>
            <p className="course-instructor">
              Professeur : <strong>{professeurNom}</strong>
            </p>
            <div className="course-badges">
              {course.matiere_nom && <span className="badge badge-purple">{course.matiere_nom}</span>}
              {course.niveau_nom && <span className="badge badge-gray">{course.niveau_nom}</span>}
              {course.langue && <span className="badge badge-gray">{course.langue.toUpperCase()}</span>}
            </div>
          </div>

          {/* Sidebar card */}
          <div className="course-sidebar">
            <div className="course-sidebar-card">
              <img src={thumbnail} alt={course.titre} />
              <div className="sidebar-card-body">
                <div className="sidebar-price">
                  {course.est_premium ? (
                    <span className="price-free">{course.prix} Ar</span>
                  ) : (
                    <span className="price-free">Gratuit</span>
                  )}
                </div>
                {enrolled ? (
                  <button className="btn btn-primary btn-full" disabled>
                    ✓ Déjà inscrit
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? "Inscription..." : "S'inscrire au cours"}
                  </button>
                )}
                {error && <p className="form-error">{error}</p>}
                {!isAuthenticated && (
                  <p className="sidebar-note">
                    Vous devez être <a onClick={() => navigate("/login")}>connecté</a> pour vous inscrire.
                  </p>
                )}
                <ul className="sidebar-features">
                  <li><FiAward /> Certificat de complétion</li>
                  <li><FiPlay /> Accès illimité</li>
                  <li><FiClock /> Apprenez à votre rythme</li>
                  <li><FiDownload /> Téléchargeable hors-ligne</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course content */}
      <div className="course-content-section">
        <div className="course-content-inner">
          <div className="course-main">
            {/* What you'll learn */}
            <div className="course-section-box">
              <h2>Ce que vous allez apprendre</h2>
              <div className="learn-grid">
                {["Maîtriser les concepts fondamentaux", "Construire des projets réels", "Bonnes pratiques professionnelles", "Préparer vos examens"].map((item) => (
                  <div key={item} className="learn-item">
                    <FiPlay /> <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leçons */}
            <div className="course-section-box">
              <h2>Programme du cours ({lecons.length} leçons)</h2>
              {!isAuthenticated ? (
                <p className="muted">Connectez-vous pour voir le programme.</p>
              ) : lecons.length === 0 ? (
                <p className="muted">Aucune leçon disponible.</p>
              ) : (
                <div className="curriculum">
                  {lecons.map((lecon) => (
                    <div key={lecon.id} className="lesson-item">
                      {enrolled ? (
                        <FiPlay className="lesson-icon" />
                      ) : (
                        <FiLock className="lesson-icon" />
                      )}
                      <span>{lecon.titre}</span>
                      {lecon.duree_minutes > 0 && (
                        <span className="lesson-duration">{lecon.duree_minutes} min</span>
                      )}
                      {lecon.est_gratuite ? (
                        <span className="badge badge-green">Gratuit</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
