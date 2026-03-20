import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Option { texte: string; est_correcte: number; explication: string; }
interface Question { enonce: string; type_question: "choix_multiple" | "vrai_faux" | "texte_libre"; points: number; ordre: number; options: Option[]; }
interface QuizForm { titre: string; description: string; duree_secondes: number; nombre_tentatives: number; score_minimum: number; }

export default function QuizManager() {
  const { leconId } = useParams<{ leconId: string }>();
  const [quizForm, setQuizForm] = useState<QuizForm>({ titre: "", description: "", duree_secondes: 0, nombre_tentatives: 3, score_minimum: 50 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId]   = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    api.get(`/quiz/lecon/${leconId}`).then(r => {
      const q = r.data?.quiz?.[0];
      if (q) {
        setQuizId(q.id);
        setQuizForm({ titre: q.titre, description: q.description || "", duree_secondes: q.duree_secondes || 0, nombre_tentatives: q.nombre_tentatives, score_minimum: q.score_minimum });
        return api.get(`/quiz/${q.id}`);
      }
    }).then(r => {
      if (r) setQuestions((r.data?.quiz?.questions || []));
    }).finally(() => setLoading(false));
  }, [leconId]);

  const addQuestion = () => setQuestions([...questions, { enonce: "", type_question: "choix_multiple", points: 1, ordre: questions.length + 1, options: [{ texte: "", est_correcte: 0, explication: "" }, { texte: "", est_correcte: 0, explication: "" }] }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, j) => j !== i));
  const setQ = (i: number, k: keyof Question, v: any) => setQuestions(questions.map((q, j) => j === i ? { ...q, [k]: v } : q));
  const addOption = (qi: number) => setQ(qi, "options", [...questions[qi].options, { texte: "", est_correcte: 0, explication: "" }]);
  const setOpt = (qi: number, oi: number, k: keyof Option, v: any) => setQ(qi, "options", questions[qi].options.map((o, j) => j === oi ? { ...o, [k]: v } : o));
  const setCorrect = (qi: number, oi: number) => setQ(qi, "options", questions[qi].options.map((o, j) => ({ ...o, est_correcte: j === oi ? 1 : 0 })));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      let qid = quizId;
      if (!qid) {
        const res = await api.post("/quiz/create", { ...quizForm, lecon_id: leconId });
        qid = res.data.quizId; setQuizId(qid);
      }
      for (const q of questions) {
        await api.post("/quiz/question", { quiz_id: qid, ...q });
      }
      setMsg("Quiz sauvegardé !");
    } catch (err: any) { setMsg(err.response?.data?.message || "Erreur"); }
    finally { setSaving(false); }
  };

  const setF = (k: keyof QuizForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setQuizForm({ ...quizForm, [k]: e.target.value });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Gérer le quiz</h1></div>
      {msg && <div className={`alert ${msg.includes("Erreur") ? "alert-error" : "alert-success"}`}>{msg}</div>}
      <form onSubmit={handleSave}>
        <div className="form-card">
          <h2>Paramètres du quiz</h2>
          <div className="form-group"><label>Titre *</label><input value={quizForm.titre} onChange={setF("titre")} required /></div>
          <div className="form-group"><label>Description</label><textarea value={quizForm.description} onChange={setF("description")} rows={2} /></div>
          <div className="form-row">
            <div className="form-group"><label>Durée (secondes, 0=illimité)</label><input type="number" value={quizForm.duree_secondes} onChange={setF("duree_secondes")} min="0" /></div>
            <div className="form-group"><label>Tentatives max</label><input type="number" value={quizForm.nombre_tentatives} onChange={setF("nombre_tentatives")} min="1" /></div>
            <div className="form-group"><label>Score minimum (%)</label><input type="number" value={quizForm.score_minimum} onChange={setF("score_minimum")} min="0" max="100" /></div>
          </div>
        </div>

        <div className="questions-list">
          {questions.map((q, qi) => (
            <div key={qi} className="question-editor">
              <div className="qe-header">
                <strong>Question {qi + 1}</strong>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeQuestion(qi)}><FiTrash2 /></button>
              </div>
              <div className="form-group"><label>Énoncé *</label><textarea value={q.enonce} onChange={e => setQ(qi, "enonce", e.target.value)} rows={2} required /></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={q.type_question} onChange={e => setQ(qi, "type_question", e.target.value)}>
                    <option value="choix_multiple">Choix multiple</option>
                    <option value="vrai_faux">Vrai / Faux</option>
                  </select>
                </div>
                <div className="form-group"><label>Points</label><input type="number" value={q.points} onChange={e => setQ(qi, "points", Number(e.target.value))} min="1" /></div>
              </div>
              <div className="options-list">
                {q.options.map((o, oi) => (
                  <div key={oi} className="option-editor">
                    <input type="radio" name={`correct-${qi}`} checked={o.est_correcte === 1} onChange={() => setCorrect(qi, oi)} />
                    <input type="text" value={o.texte} onChange={e => setOpt(qi, oi, "texte", e.target.value)} placeholder={`Option ${oi + 1}`} />
                    <input type="text" value={o.explication} onChange={e => setOpt(qi, oi, "explication", e.target.value)} placeholder="Explication (optionnel)" />
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => addOption(qi)}><FiPlus /> Option</button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={addQuestion}><FiPlus /> Ajouter une question</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Sauvegarde..." : "Sauvegarder le quiz"}</button>
        </div>
      </form>
    </div>
  );
}
