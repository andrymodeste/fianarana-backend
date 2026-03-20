import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { FiUsers, FiBookOpen, FiDollarSign, FiStar, FiAlertCircle, FiCheck } from "react-icons/fi";

interface Stats { nb_utilisateurs: number; nb_nouveaux_ce_mois: number; nb_cours_publies: number; nb_abonnements_actifs: number; revenus_total: number; revenus_ce_mois: number; nb_cours_en_attente: number; nb_profs_en_attente: number; top_cours: any[]; top_professeurs: any[]; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!stats)  return <div className="page-container"><p>Erreur de chargement.</p></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header"><h1>Tableau de bord administrateur</h1></div>

      <div className="dashboard-stats">
        {[
          { icon: <FiUsers />,      val: stats.nb_utilisateurs,      label: "Utilisateurs", sub: `+${stats.nb_nouveaux_ce_mois} ce mois` },
          { icon: <FiBookOpen />,   val: stats.nb_cours_publies,     label: "Cours publiés", sub: "" },
          { icon: <FiUsers />,      val: stats.nb_abonnements_actifs, label: "Abonnements actifs", sub: "" },
          { icon: <FiDollarSign />, val: `${(stats.revenus_total || 0).toLocaleString()} Ar`, label: "Revenus total", sub: `${(stats.revenus_ce_mois || 0).toLocaleString()} Ar ce mois` },
        ].map(s => (
          <div key={s.label} className="dashboard-stat-card">
            <div className="dsc-icon">{s.icon}</div>
            <div className="dsc-val">{s.val}</div>
            <div className="dsc-label">{s.label}</div>
            {s.sub && <div className="dsc-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      {(stats.nb_cours_en_attente > 0 || stats.nb_profs_en_attente > 0) && (
        <div className="admin-alerts">
          {stats.nb_cours_en_attente > 0 && (
            <Link to="/admin/validation-cours" className="admin-alert-card">
              <FiAlertCircle /> <strong>{stats.nb_cours_en_attente}</strong> cours en attente de validation
            </Link>
          )}
          {stats.nb_profs_en_attente > 0 && (
            <Link to="/admin/validation-profs" className="admin-alert-card">
              <FiAlertCircle /> <strong>{stats.nb_profs_en_attente}</strong> professeurs en attente de vérification
            </Link>
          )}
        </div>
      )}

      <div className="admin-grid">
        <div className="dashboard-section">
          <h2>Cours les plus populaires</h2>
          <table className="admin-table">
            <thead><tr><th>Cours</th><th>Inscrits</th></tr></thead>
            <tbody>{stats.top_cours.map((c, i) => (
              <tr key={i}><td>{c.titre}</td><td>{c.nb_inscrits}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="dashboard-section">
          <h2>Professeurs les mieux notés</h2>
          <table className="admin-table">
            <thead><tr><th>Professeur</th><th>Note</th></tr></thead>
            <tbody>{stats.top_professeurs.map((p, i) => (
              <tr key={i}><td>{p.prenom} {p.nom}</td><td><FiStar size={12} /> {parseFloat(p.note_moyenne).toFixed(1)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      <div className="admin-quick-links">
        <h2>Navigation rapide</h2>
        <div className="quick-actions">
          <Link to="/admin/utilisateurs" className="quick-action"><FiUsers /> Utilisateurs</Link>
          <Link to="/admin/validation-cours" className="quick-action"><FiCheck /> Validation cours</Link>
          <Link to="/admin/validation-profs" className="quick-action"><FiCheck /> Validation profs</Link>
          <Link to="/admin/catalogue" className="quick-action"><FiBookOpen /> Catalogue</Link>
          <Link to="/admin/abonnements" className="quick-action"><FiDollarSign /> Abonnements</Link>
          <Link to="/admin/avis" className="quick-action"><FiStar /> Avis</Link>
          <Link to="/admin/badges" className="quick-action">🏆 Badges</Link>
          <Link to="/admin/notifications" className="quick-action">🔔 Notifications</Link>
        </div>
      </div>
    </div>
  );
}
