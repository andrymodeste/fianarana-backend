import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import type { Avis } from "../../types";
import { FiStar, FiEdit2, FiTrash2 } from "react-icons/fi";
import { photoUrl } from "../../utils/photoUrl";

interface Props { coursId: number; avis: Avis[]; avgNote: number; isEnrolled: boolean; }

function Stars({ note, onChange }: { note: number; onChange?: (n: number) => void }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`star ${n <= note ? "filled" : ""}`}
          onClick={() => onChange?.(n)} style={{ cursor: onChange ? "pointer" : "default" }}>
          <FiStar size={16} />
        </span>
      ))}
    </div>
  );
}

export default function ReviewList({ coursId, avis: initialAvis, avgNote, isEnrolled }: Props) {
  const { isAuthenticated, user } = useAuth();
  const [avis, setAvis]    = useState(initialAvis);
  const [note, setNote]    = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const myAvis = avis.find(a => a.eleve_id === user?.id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/avis/${editId}`, { note, commentaire });
        setAvis(avis.map(a => a.id === editId ? { ...a, note, commentaire } : a));
        setEditId(null);
      } else {
        const res = await api.post("/avis", { cours_id: coursId, note, commentaire });
        const newAvis: Avis = { id: res.data.avisId, eleve_id: user!.id, cours_id: coursId, note, commentaire, nom: user!.nom, prenom: user!.prenom, photo_url: user!.photo_url || "", cree_le: new Date().toISOString() };
        setAvis([newAvis, ...avis]);
      }
      setCommentaire(""); setNote(5);
    } catch { } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await api.delete(`/avis/${id}`);
    setAvis(avis.filter(a => a.id !== id));
  };

  return (
    <section className="reviews-section">
      <h2>Avis des élèves</h2>
      <div className="reviews-summary">
        <div className="avg-score">{parseFloat(String(avgNote)).toFixed(1)}</div>
        <Stars note={Math.round(avgNote)} />
        <span>{avis.length} avis</span>
      </div>

      {isAuthenticated && isEnrolled && !myAvis && (
        <form onSubmit={submit} className="review-form">
          <h3>Laisser un avis</h3>
          <Stars note={note} onChange={setNote} />
          <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience..." rows={3} />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Envoi..." : "Publier"}</button>
        </form>
      )}

      {editId && myAvis && (
        <form onSubmit={submit} className="review-form">
          <h3>Modifier votre avis</h3>
          <Stars note={note} onChange={setNote} />
          <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={3} />
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditId(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "..." : "Mettre à jour"}</button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {avis.length === 0 && <p className="empty-msg">Aucun avis pour ce cours.</p>}
        {avis.map(a => (
          <div key={a.id} className="review-card">
            <img src={photoUrl(a.photo_url) || `https://ui-avatars.com/api/?name=${a.prenom}+${a.nom}&background=7B5EA7&color=fff`} alt="avatar" />
            <div className="review-content">
              <div className="review-header">
                <strong>{a.prenom} {a.nom}</strong>
                <Stars note={a.note} />
                <span className="review-date">{new Date(a.cree_le).toLocaleDateString("fr-FR")}</span>
                {user?.id === a.eleve_id && (
                  <div className="review-actions">
                    <button onClick={() => { setEditId(a.id); setNote(a.note); setCommentaire(a.commentaire || ""); }}><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(a.id)}><FiTrash2 size={14} /></button>
                  </div>
                )}
              </div>
              {a.commentaire && <p>{a.commentaire}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
