import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import type { Inscription, Abonnement, Notification } from "../../types";
import { FiBookOpen, FiAward, FiBell, FiCalendar, FiPlay, FiCheck, FiTrash2 } from "react-icons/fi";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [cours, setCours]               = useState<Inscription[]>([]);
  const [abonnement, setAbonnement]     = useState<Abonnement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/inscriptions/mes-cours").catch(() => ({ data: { cours: [] } })),
      api.get("/abonnements/mon-abonnement").catch(() => ({ data: null })),
      api.get("/notifications").catch(() => ({ data: { notifications: [] } })),
    ]).then(([ins, abo, notif]) => {
      setCours(ins.data?.cours || []);
      setAbonnement(abo.data?.abonnement || null);
      setNotifications(notif.data?.notifications || []);
    }).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    await api.put(`/notifications/${id}/lue`);
    setNotifications(notifications.map(n => n.id === id ? { ...n, est_lue: 1 } : n));
  };

  const deleteNotif = async (id: number) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadNotifs = notifications.filter(n => !n.est_lue);
  const enCours = cours.filter(c => !c.est_termine);
  const termines = cours.filter(c => c.est_termine);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Bonjour, {user?.prenom} ! 👋</h1>
          <p className="dashboard-subtitle">Continuez votre apprentissage</p>
        </div>
        {abonnement && (
          <div className="subscription-badge">
            <FiCalendar />
            <span>{abonnement.plan_nom} · expire le {new Date(abonnement.fin).toLocaleDateString("fr-FR")}</span>
          </div>
        )}
      </div>

      <div className="dashboard-stats">
        {[
          { icon: <FiBookOpen />, val: cours.length, label: "Cours inscrits" },
          { icon: <FiPlay />,     val: enCours.length, label: "En cours" },
          { icon: <FiCheck />,   val: termines.length, label: "Terminés" },
          { icon: <FiBell />,    val: unreadNotifs.length, label: "Notifications" },
        ].map(s => (
          <div key={s.label} className="dashboard-stat-card">
            <div className="dsc-icon">{s.icon}</div>
            <div className="dsc-val">{s.val}</div>
            <div className="dsc-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Cours en cours</h2>
              <Link to="/mes-cours" className="link-all">Voir tout</Link>
            </div>
            {enCours.length === 0 ? (
              <div className="empty-state-sm">
                <p>Aucun cours en cours. <Link to="/cours">Découvrir des cours</Link></p>
              </div>
            ) : (
              enCours.slice(0, 4).map(c => (
                <div key={c.id} className="dashboard-course-item">
                  <img src={c.image_url || "/placeholder-course.jpg"} alt="" />
                  <div className="dci-info">
                    <div className="dci-titre">{c.titre}</div>
                    <div className="progress-wrap">
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${c.progression || 0}%` }} /></div>
                      <span>{Math.round(c.progression || 0)}%</span>
                    </div>
                  </div>
                  <Link to={`/cours/${c.cours_id}/apprendre`} className="btn btn-sm btn-primary"><FiPlay /></Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-col">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                Notifications
                {unreadNotifs.length > 0 && <span className="notif-count">{unreadNotifs.length}</span>}
              </h2>
              {notifications.length > 0 && (
                <button className="link-all" onClick={() => api.put("/notifications/toutes-lues").then(() =>
                  setNotifications(notifications.map(n => ({ ...n, est_lue: 1 }))))}>
                  Tout lire
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="empty-state-sm">Aucune notification.</p>
            ) : (
              notifications.slice(0, 8).map(n => (
                <div key={n.id} className={`notif-item ${!n.est_lue ? "unread" : ""}`} onClick={() => !n.est_lue && markRead(n.id)}>
                  <div className="notif-content">
                    <div className="notif-titre">{n.titre}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{new Date(n.cree_le).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <button className="notif-delete" onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}><FiTrash2 size={14} /></button>
                </div>
              ))
            )}
          </div>

          {!abonnement && (
            <div className="upsell-card">
              <FiAward size={32} />
              <h3>Passez à Premium</h3>
              <p>Accédez à des centaines de cours supplémentaires</p>
              <Link to="/abonnement" className="btn btn-primary btn-full">Voir les plans</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
