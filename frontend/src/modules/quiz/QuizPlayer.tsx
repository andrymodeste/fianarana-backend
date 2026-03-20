import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import type { Quiz } from "../../types";
import { FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

interface Question { id: number; enonce: string; type_question: string; points: number; ordre: number; image_url?: string; explication_globale?: string; options: { id: number; texte: string; est_correcte: number; explication?: string; }[]; }
interface Reponse { question_id: number; option_id?: number; texte_libre?: string; }
interface Resultat { score: number; points_obtenus: number; points_total: number; est_valide: number; tentative_num: number; }

export default function QuizPlayer() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz]     = useState<Quiz & { questions: Question[] } | null>(null);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/quiz/${quizId}`).then(r => {
      setQuiz(r.data.quiz);
      if (r.data.quiz.duree_secondes) setTimeLeft(r.data.quiz.duree_secondes);
    }).finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => { if (p && p <= 1) { clearInterval(t); handleSubmit(); return 0; } return (p || 0) - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const setReponse = (questionId: number, optionId: number) => {
    setReponses(prev => {
      const existing = prev.find(r => r.question_id === questionId);
      if (existing) return prev.map(r => r.question_id === questionId ? { ...r, option_id: optionId } : r);
      return [...prev, { question_id: questionId, option_id: optionId }];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/quiz/soumettre", { quiz_id: Number(quizId), reponses, duree_secondes: quiz?.duree_secondes });
      setResultat(res.data.resultat);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur");
    } finally { setSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!quiz)   return <div className="page-container"><p>Quiz introuvable.</p></div>;

  if (resultat) {
    return (
      <div className="quiz-result-page">
        <div className="quiz-result-card">
          {resultat.est_valide ? <FiCheckCircle size={64} className="result-icon success" /> : <FiXCircle size={64} className="result-icon error" />}
          <h1>{resultat.est_valide ? "Quiz réussi ! 🎉" : "Quiz non réussi"}</h1>
          <div className="score-display">{Math.round(resultat.score)}%</div>
          <p>{resultat.points_obtenus} / {resultat.points_total} points</p>
          <p>Tentative n°{resultat.tentative_num}</p>
          <div className="quiz-result-actions">
            <button className="btn btn-outline" onClick={() => navigate(-1)}>Retour au cours</button>
            {!resultat.est_valide && quiz.nombre_tentatives > resultat.tentative_num && (
              <button className="btn btn-primary" onClick={() => { setResultat(null); setReponses([]); }}>Réessayer</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>{quiz.titre}</h1>
        {timeLeft !== null && (
          <div className={`quiz-timer ${timeLeft < 60 ? "urgent" : ""}`}>
            <FiClock /> {formatTime(timeLeft)}
          </div>
        )}
      </div>
      {quiz.description && <p className="quiz-desc">{quiz.description}</p>}

      <div className="quiz-questions">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="quiz-question">
            <div className="question-header">
              <span className="question-num">Question {qi + 1}</span>
              <span className="question-pts">{q.points} pt{q.points > 1 ? "s" : ""}</span>
            </div>
            <p className="question-enonce">{q.enonce}</p>
            {q.image_url && <img src={q.image_url} alt="illustration" className="question-img" />}
            <div className="question-options">
              {q.options.map(o => (
                <label key={o.id} className={`option ${reponses.find(r => r.question_id === q.id)?.option_id === o.id ? "selected" : ""}`}>
                  <input type="radio" name={`q-${q.id}`} value={o.id} onChange={() => setReponse(q.id, o.id)} />
                  <span>{o.texte}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-submit">
        <p>{reponses.length} / {quiz.questions.length} réponses</p>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting || reponses.length === 0}>
          {submitting ? "Envoi..." : "Soumettre le quiz"}
        </button>
      </div>
    </div>
  );
}
