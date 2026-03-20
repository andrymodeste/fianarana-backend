import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import type { Matiere, Niveau } from "../../../types";
import { FiUpload, FiArrowLeft } from "react-icons/fi";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: "", description: "", matiere_id: "", niveau_id: "", est_premium: "0", prix: "", langue: "fr" });
  const [image, setImage]     = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux]   = useState<Niveau[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    api.get("/categories/matieres").then(r => setMatieres(r.data?.matieres || [])).catch(() => {});
    api.get("/niveaux").then(r => setNiveaux(r.data?.niveaux || [])).catch(() => {});
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.titre.trim()) return setError("Le titre est requis");
    if (!form.matiere_id || !form.niveau_id) return setError("La matière et le niveau sont requis");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const res = await api.post("/cours/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
      navigate(`/professeur/cours/${res.data.coursId}/lecons`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><FiArrowLeft /> Retour</button>
        <h1>Créer un nouveau cours</h1>
      </div>
      <div className="form-card form-card-wide">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre du cours *</label>
            <input value={form.titre} onChange={set("titre")} placeholder="Ex: Mathématiques - Trigonométrie" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={set("description")} rows={4} placeholder="Décrivez votre cours..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Matière *</label>
              <select value={form.matiere_id} onChange={set("matiere_id")} required>
                <option value="">-- Choisir --</option>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Niveau *</label>
              <select value={form.niveau_id} onChange={set("niveau_id")} required>
                <option value="">-- Choisir --</option>
                {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Langue</label>
              <select value={form.langue} onChange={set("langue")}>
                <option value="fr">Français</option>
                <option value="mg">Malgache</option>
                <option value="en">Anglais</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select value={form.est_premium} onChange={set("est_premium")}>
                <option value="0">Gratuit</option>
                <option value="1">Premium</option>
              </select>
            </div>
            {form.est_premium === "1" && (
              <div className="form-group">
                <label>Prix (Ar)</label>
                <input type="number" value={form.prix} onChange={set("prix")} placeholder="Ex: 5000" min="0" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Image de couverture</label>
            <div className="image-upload" onClick={() => document.getElementById("img-input")?.click()}>
              {preview ? <img src={preview} alt="preview" /> : <div className="upload-placeholder"><FiUpload size={32} /><p>Cliquez pour uploader</p></div>}
              <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Création..." : "Créer le cours"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
