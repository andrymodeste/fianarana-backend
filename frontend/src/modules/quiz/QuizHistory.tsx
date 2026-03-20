import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiAward, FiCheck, FiX } from "react-icons/fi";

interface Resultat { id: number; quiz_id: number; quiz_titre: string; score: number; points_obtenus: number; points_total: number; est_valide: number; tentative_num: number; fait_le: string; }

export default function QuizHistory() {
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/quiz/mes-resultats").then(r => setResultats(r.data?.resultats || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Historique des quiz</h1></div>
      {resultats.length === 0 ? (
        <div className="empty-state"><FiAward size={48} /><p>Aucun quiz passé pour l'instant.</p></div>
      ) : (
        <div className="quiz-history-list">
          {resultats.map(r => (
            <div key={r.id} className={`quiz-history-card ${r.est_valide ? "success" : "failed"}`}>
              <div className="qh-icon">{r.est_valide ? <FiCheck /> : <FiX />}</div>
              <div className="qh-info">
                <h3>{r.quiz_titre}</h3>
                <p>Tentative n°{r.tentative_num} • {new Date(r.fait_le).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="qh-score">
                <div className="score-circle" style={{ "--pct": `${r.score}%` } as React.CSSProperties}>{Math.round(r.score)}%</div>
                <span>{r.points_obtenus}/{r.points_total} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
