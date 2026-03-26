import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { photoUrl } from "../utils/photoUrl";
import type { Inscription, Abonnement } from "../types";
import { FiBookOpen, FiClock, FiAward, FiCalendar } from "react-icons/fi";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mesCours, setMesCours] = useState<Inscription[]>([]);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    Promise.all([
      api.get("/inscriptions/mes-cours").catch(() => ({ data: [] })),
      api.get("/abonnements/mon-abonnement").catch(() => ({ data: null })),
    ]).then(([coursesRes, subRes]) => {
      setMesCours(coursesRes.data?.cours || coursesRes.data || []);
      setAbonnement(subRes.data?.abonnement || subRes.data || null);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-inner">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Bonjour, {user?.prenom} 👋</h1>
            <p>Continuez votre apprentissage là où vous vous êtes arrêté.</p>
          </div>
        </div>

        {/* Subscription banner */}
        {abonnement ? (
          <div className="subscription-banner active">
            <div className="sub-info">
              <FiAward size={24} />
              <div>
                <strong>Abonnement {abonnement.plan_nom || "Actif"}</strong>
                <span>
                  <FiCalendar /> Expire le {formatDate(abonnement.fin)}
                </span>
              </div>
            </div>
            <span className="badge badge-green">Actif</span>
          </div>
        ) : (
          <div className="subscription-banner inactive">
            <div className="sub-info">
              <FiAward size={24} />
              <div>
                <strong>Pas d'abonnement actif</strong>
                <span>Abonnez-vous pour accéder à tous les cours</span>
              </div>
            </div>
            <Link to="/pricing" className="btn btn-primary">
              S'abonner maintenant
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dash-stat">
            <FiBookOpen size={28} />
            <div>
              <strong>{mesCours.length}</strong>
              <span>Cours inscrits</span>
            </div>
          </div>
          <div className="dash-stat">
            <FiClock size={28} />
            <div>
              <strong>0h</strong>
              <span>Temps d'apprentissage</span>
            </div>
          </div>
          <div className="dash-stat">
            <FiAward size={28} />
            <div>
              <strong>0</strong>
              <span>Certificats obtenus</span>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Mes cours</h2>
            <Link to="/courses" className="section-link">
              Trouver d'autres cours
            </Link>
          </div>

          {mesCours.length === 0 ? (
            <div className="empty-state">
              <FiBookOpen size={48} />
              <h3>Aucun cours pour le moment</h3>
              <p>Explorez notre catalogue et inscrivez-vous à vos premiers cours.</p>
              <Link to="/courses" className="btn btn-primary">
                Explorer les cours
              </Link>
            </div>
          ) : (
            <div className="my-courses-list">
              {mesCours.map((inscription) => {
                const profNom = `${inscription.professeur_prenom || ""} ${inscription.professeur_nom || ""}`.trim();
                const imgSrc = photoUrl(inscription.image_url) || `https://picsum.photos/seed/${inscription.cours_id}/120/68`;
                return (
                  <Link to={`/courses/${inscription.cours_id}`} key={inscription.id} className="my-course-item">
                    <img src={imgSrc} alt={inscription.titre} />
                    <div className="my-course-info">
                      <h4>{inscription.titre}</h4>
                      <p>{profNom}</p>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${inscription.progression || 0}%` }} />
                      </div>
                      <span className="progress-label">{inscription.progression || 0}% complété</span>
                    </div>
                    <span className="my-course-action">Continuer →</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
