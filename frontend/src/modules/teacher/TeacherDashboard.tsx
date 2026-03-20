import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import type { Cours } from "../../types";
import { FiBookOpen, FiUsers, FiStar, FiPlus, FiMessageSquare } from "react-icons/fi";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [cours, setCours]   = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEleves: 0, noteMoyenne: 0, coursPublies: 0 });

  useEffect(() => {
    api.get("/cours/mes-cours").then(r => {
      const c = r.data?.cours || [];
      setCours(c);
      const publies = c.filter((x: Cours) => x.est_publie).length;
      const totalEleves = c.reduce((s: number, x: Cours) => s + (x.nb_inscrits || 0), 0);
      const notesArr = c.filter((x: Cours) => (x.note_moyenne || 0) > 0).map((x: Cours) => x.note_moyenne || 0);
      const noteMoyenne = notesArr.length ? notesArr.reduce((a: number, b: number) => a + b, 0) / notesArr.length : 0;
      setStats({ totalEleves, noteMoyenne, coursPublies: publies });
    }).finally(() => setLoading(false));
  }, []);

  const statusLabel: Record<string, string> = { brouillon: "Brouillon", en_attente: "En attente", valide: "Validé", archive: "Archivé", rejete: "Rejeté" };
  const statusColor: Record<string, string> = { brouillon: "gray", en_attente: "yellow", valide: "green", archive: "gray", rejete: "red" };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord professeur</h1>
          <p>Bonjour, {user?.prenom} !</p>
        </div>
        <Link to="/professeur/nouveau-cours" className="btn btn-primary"><FiPlus /> Nouveau cours</Link>
      </div>

      <div className="dashboard-stats">
        {[
          { icon: <FiBookOpen />, val: cours.length,       label: "Mes cours" },
          { icon: <FiBookOpen />, val: stats.coursPublies, label: "Publiés" },
          { icon: <FiUsers />,   val: stats.totalEleves,  label: "Élèves inscrits" },
          { icon: <FiStar />,    val: stats.noteMoyenne.toFixed(1), label: "Note moyenne" },
        ].map(s => (
          <div key={s.label} className="dashboard-stat-card">
            <div className="dsc-icon">{s.icon}</div>
            <div className="dsc-val">{s.val}</div>
            <div className="dsc-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Mes cours</h2>
          <Link to="/professeur/cours" className="link-all">Voir tout</Link>
        </div>
        {cours.length === 0 ? (
          <div className="empty-state">
            <FiBookOpen size={48} />
            <p>Vous n'avez pas encore de cours.</p>
            <Link to="/professeur/nouveau-cours" className="btn btn-primary"><FiPlus /> Créer un cours</Link>
          </div>
        ) : (
          <div className="teacher-courses-table">
            <table>
              <thead><tr><th>Titre</th><th>Matière</th><th>Statut</th><th>Élèves</th><th>Note</th><th>Actions</th></tr></thead>
              <tbody>
                {cours.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.titre}</strong></td>
                    <td>{c.matiere_nom}</td>
                    <td><span className={`badge-status status-${statusColor[c.statut || "brouillon"]}`}>{statusLabel[c.statut || "brouillon"]}</span></td>
                    <td>{c.nb_inscrits || 0}</td>
                    <td>{parseFloat(String(c.note_moyenne || 0)).toFixed(1)} ⭐</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/professeur/cours/${c.id}/modifier`} className="btn btn-sm btn-outline">Modifier</Link>
                        <Link to={`/professeur/cours/${c.id}/lecons`} className="btn btn-sm btn-outline">Leçons</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header"><h2>Actions rapides</h2></div>
        <div className="quick-actions">
          <Link to="/professeur/nouveau-cours" className="quick-action"><FiPlus /> Créer un cours</Link>
          <Link to="/messages" className="quick-action"><FiMessageSquare /> Messages</Link>
          <Link to="/professeur/mon-profil" className="quick-action">👤 Mon profil pro</Link>
          <Link to="/professeur/mes-eleves" className="quick-action"><FiUsers /> Mes élèves</Link>
        </div>
      </div>
    </div>
  );
}
