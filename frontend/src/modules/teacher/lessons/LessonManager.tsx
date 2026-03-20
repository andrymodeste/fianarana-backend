import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import type { Cours, Lecon } from "../../../types";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiSend } from "react-icons/fi";

interface LessonForm { titre: string; description: string; video_url: string; pdf_url: string; ordre: number; duree_minutes: number; est_gratuite: number; est_telechargeable: number; }
const empty: LessonForm = { titre: "", description: "", video_url: "", pdf_url: "", ordre: 1, duree_minutes: 0, est_gratuite: 0, est_telechargeable: 1 };

export default function LessonManager() {
  const { coursId } = useParams<{ coursId: string }>();
  const navigate = useNavigate();
  const [course, setCourse]   = useState<Cours | null>(null);
  const [lecons, setLecons]   = useState<Lecon[]>([]);
  const [form, setForm]       = useState<LessonForm>(empty);
  const [editId, setEditId]   = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!coursId) return;
    Promise.all([api.get(`/cours/${coursId}`), api.get(`/lecons/cours/${coursId}`)])
      .then(([c, l]) => { setCourse(c.data.cours); setLecons(l.data?.lecons || []); })
      .finally(() => setLoading(false));
  }, [coursId]);

  const openCreate = () => { setForm({ ...empty, ordre: lecons.length + 1 }); setEditId(null); setShowForm(true); };
  const openEdit   = (l: Lecon) => { setForm({ titre: l.titre, description: l.description || "", video_url: l.video_url || "", pdf_url: l.pdf_url || "", ordre: l.ordre, duree_minutes: l.duree_minutes || 0, est_gratuite: l.est_gratuite, est_telechargeable: l.est_telechargeable }); setEditId(l.id); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) return setError("Le titre est requis");
    setSaving(true); setError("");
    try {
      if (editId) {
        await api.put(`/lecons/${editId}`, { ...form, cours_id: coursId });
        setLecons(lecons.map(l => l.id === editId ? { ...l, ...form } : l));
      } else {
        const res = await api.post("/lecons/create", { ...form, cours_id: coursId });
        const newL: Lecon = { id: res.data.leconId, cours_id: Number(coursId), ...form };
        setLecons([...lecons, newL]);
      }
      setShowForm(false); setForm(empty); setEditId(null);
    } catch (err: any) { setError(err.response?.data?.message || "Erreur"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette leçon ?")) return;
    await api.delete(`/lecons/${id}`);
    setLecons(lecons.filter(l => l.id !== id));
  };

  const submitCourse = async () => {
    if (!confirm("Soumettre ce cours pour validation ?")) return;
    await api.put(`/cours/${coursId}/soumettre`);
    alert("Cours soumis pour validation !");
    navigate("/professeur");
  };

  const set = (k: keyof LessonForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked ? 1 : 0 : e.target.value });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/professeur")}><FiArrowLeft /> Retour</button>
        <div>
          <h1>{course?.titre}</h1>
          <p>Gérer les leçons du cours</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={openCreate}><FiPlus /> Ajouter une leçon</button>
          {lecons.length > 0 && (
            <button className="btn btn-primary" onClick={submitCourse}><FiSend /> Soumettre pour validation</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editId ? "Modifier la leçon" : "Nouvelle leçon"}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Titre *</label><input value={form.titre} onChange={set("titre")} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={set("description")} rows={3} /></div>
              <div className="form-row">
                <div className="form-group"><label>URL vidéo</label><input value={form.video_url} onChange={set("video_url")} placeholder="https://..." /></div>
                <div className="form-group"><label>URL PDF</label><input value={form.pdf_url} onChange={set("pdf_url")} placeholder="https://..." /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Ordre</label><input type="number" value={form.ordre} onChange={set("ordre")} min="1" /></div>
                <div className="form-group"><label>Durée (min)</label><input type="number" value={form.duree_minutes} onChange={set("duree_minutes")} min="0" /></div>
              </div>
              <div className="form-row">
                <label className="checkbox-label"><input type="checkbox" checked={form.est_gratuite === 1} onChange={e => setForm({ ...form, est_gratuite: e.target.checked ? 1 : 0 })} /> Leçon gratuite</label>
                <label className="checkbox-label"><input type="checkbox" checked={form.est_telechargeable === 1} onChange={e => setForm({ ...form, est_telechargeable: e.target.checked ? 1 : 0 })} /> Téléchargeable</label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lecons.length === 0 ? (
        <div className="empty-state"><p>Aucune leçon. <button className="btn btn-primary" onClick={openCreate}>Ajouter la première leçon</button></p></div>
      ) : (
        <div className="lessons-manager-list">
          {lecons.sort((a, b) => a.ordre - b.ordre).map((l, i) => (
            <div key={l.id} className="lesson-manage-row">
              <span className="lesson-order">{i + 1}</span>
              <div className="lesson-manage-info">
                <strong>{l.titre}</strong>
                <span>{l.duree_minutes} min</span>
                {l.est_gratuite ? <span className="badge-free">Gratuit</span> : null}
              </div>
              <div className="lesson-manage-actions">
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(l)}><FiEdit2 /></button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(l.id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
