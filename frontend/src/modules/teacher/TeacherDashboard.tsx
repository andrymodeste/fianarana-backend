import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import type { Cours } from "../../types";
import { FiBookOpen, FiUsers, FiStar, FiPlus, FiMessageSquare, FiAlertCircle, FiEdit2, FiSend } from "react-icons/fi";

interface ProfilProf {
  est_verifie?: number;
  bio?: string;
  specialites?: string;
  diplomes?: string;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [cours, setCours]   = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEleves: 0, noteMoyenne: 0, coursPublies: 0 });
  const [profil, setProfil] = useState<ProfilProf | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/professeurs/mon-profil").catch(() => ({ data: { profil: null } })),
      api.get("/cours/mes-cours").catch((err) => {
        // Si 403 PROFESSOR_NOT_VERIFIED, c'est normal
        if (err.response?.data?.code === "PROFESSOR_NOT_VERIFIED") return { data: { cours: [] } };
        return { data: { cours: [] } };
      }),
    ]).then(([profRes, coursRes]) => {
      setProfil(profRes.data?.profil || null);
      const c = coursRes.data?.cours || [];
      setCours(c);
      const publies = c.filter((x: Cours) => x.est_publie).length;
      const totalEleves = c.reduce((s: number, x: Cours) => s + (x.nb_inscrits || 0), 0);
      const notesArr = c.filter((x: Cours) => (x.note_moyenne || 0) > 0).map((x: Cours) => x.note_moyenne || 0);
      const noteMoyenne = notesArr.length ? notesArr.reduce((a: number, b: number) => a + b, 0) / notesArr.length : 0;
      setStats({ totalEleves, noteMoyenne, coursPublies: publies });
    }).finally(() => setLoading(false));
  }, []);

  const isVerified = profil?.est_verifie === 1;
  const hasProfile = profil && profil.bio;

  const statusLabel: Record<string, string> = { brouillon: "Brouillon", en_attente: "En attente", valide: "Validé", archive: "Archivé", rejete: "Rejeté" };
  const statusColor: Record<string, string> = { brouillon: "gray", en_attente: "yellow", valide: "green", archive: "gray", rejete: "red" };

  const handleSubmit = async (coursId: number) => {
    if (!confirm("Soumettre ce cours pour validation par l'administrateur ?")) return;
    try {
      await api.put(`/cours/${coursId}/soumettre`);
      setCours(cours.map(c => c.id === coursId ? { ...c, statut: "en_attente" } : c));
    } catch (err: any) { alert(err.response?.data?.message || "Erreur lors de la soumission"); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord professeur</h1>
          <p>Bonjour, {user?.prenom} !</p>
        </div>
        {isVerified && <Link to="/professeur/nouveau-cours" className="btn btn-primary"><FiPlus /> Nouveau cours</Link>}
      </div>

      {/* ── Bannière de statut de vérification ── */}
      {!isVerified && (
        <div className="verification-banner">
          <div className="verification-icon"><FiAlertCircle size={28} /></div>
          <div className="verification-content">
            {!hasProfile ? (
              <>
                <h3>Complétez votre profil professionnel</h3>
                <p>Pour commencer à enseigner sur Fianarana, vous devez d'abord remplir votre profil professionnel (bio, spécialités, diplômes). Un administrateur vérifiera ensuite votre profil.</p>
                <Link to="/professeur/mon-profil" className="btn btn-primary btn-sm"><FiEdit2 size={14} /> Compléter mon profil</Link>
              </>
            ) : (
              <>
                <h3>Votre profil est en attente de vérification</h3>
                <p>Un administrateur va examiner votre profil professionnel. Vous recevrez une notification dès que votre compte sera validé. En attendant, vous pouvez modifier votre profil.</p>
                <Link to="/professeur/mon-profil" className="btn btn-outline btn-sm"><FiEdit2 size={14} /> Voir mon profil</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Contenu normal : seulement si vérifié ── */}
      {isVerified && (
        <>
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
                    {cours.map(c => {
                      const statut = c.statut || "brouillon";
                      const canSubmit = statut === "brouillon" || statut === "rejete";
                      const canEdit = ["brouillon", "en_attente", "rejete"].includes(statut);
                      return (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.titre}</strong>
                            {statut === "rejete" && c.motif_rejet && (
                              <div className="reject-reason">Motif : {c.motif_rejet}</div>
                            )}
                          </td>
                          <td>{c.matiere_nom}</td>
                          <td><span className={`badge-status status-${statusColor[statut]}`}>{statusLabel[statut]}</span></td>
                          <td>{c.nb_inscrits || 0}</td>
                          <td>{parseFloat(String(c.note_moyenne || 0)).toFixed(1)}</td>
                          <td>
                            <div className="table-actions">
                              {canEdit && <Link to={`/professeur/cours/${c.id}/modifier`} className="btn btn-sm btn-outline">Modifier</Link>}
                              <Link to={`/professeur/cours/${c.id}/lecons`} className="btn btn-sm btn-outline">Leçons</Link>
                              {canSubmit && <button className="btn btn-sm btn-primary" onClick={() => handleSubmit(c.id)}><FiSend size={12} /> Soumettre</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
              <Link to="/professeur/mon-profil" className="quick-action"><FiUsers /> Mon profil pro</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
