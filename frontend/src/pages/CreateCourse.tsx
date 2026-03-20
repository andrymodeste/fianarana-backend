import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Matiere, Niveau } from "../types";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

export default function CreateCourse() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [matiereId, setMatiereId] = useState<number | "">("");
  const [niveauId, setNiveauId] = useState<number | "">("");
  const [estPremium, setEstPremium] = useState(false);
  const [prix, setPrix] = useState("");
  const [langue, setLangue] = useState("fr");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);

  useEffect(() => {
    api.get("/categories/matieres").then((res) => setMatieres(res.data?.matieres || [])).catch(() => {});
    api.get("/niveaux").then((res) => setNiveaux(res.data?.niveaux || [])).catch(() => {});
  }, []);

  if (!isAuthenticated || user?.role !== "professeur") {
    navigate("/");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError("Le titre est obligatoire");
      return;
    }
    if (!matiereId || !niveauId) {
      setError("La matière et le niveau sont obligatoires");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("matiere_id", String(matiereId));
      formData.append("niveau_id", String(niveauId));
      formData.append("est_premium", estPremium ? "1" : "0");
      formData.append("prix", prix || "0");
      formData.append("langue", langue);
      if (thumbnailFile) {
        formData.append("image", thumbnailFile);
      }

      await api.post("/cours/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/instructor");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création du cours");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-page">
      <div className="create-course-inner">
        <Link to="/instructor" className="back-link">
          <FiArrowLeft /> Retour à l'espace professeur
        </Link>
        <h1>Créer un nouveau cours</h1>

        <form onSubmit={handleSubmit} className="create-course-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="titre">Titre du cours *</label>
            <input
              id="titre"
              type="text"
              placeholder="Ex: Mathématiques - Algèbre niveau 3ème"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Décrivez ce que les élèves vont apprendre..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="matiere">Matière *</label>
              <select id="matiere" value={matiereId} onChange={(e) => setMatiereId(Number(e.target.value))} required>
                <option value="">Sélectionner une matière</option>
                {matieres.map((m) => (
                  <option key={m.id} value={m.id}>{m.nom} ({m.categorie_nom})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="niveau">Niveau *</label>
              <select id="niveau" value={niveauId} onChange={(e) => setNiveauId(Number(e.target.value))} required>
                <option value="">Sélectionner un niveau</option>
                {niveaux.map((n) => (
                  <option key={n.id} value={n.id}>{n.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="langue">Langue</label>
              <select id="langue" value={langue} onChange={(e) => setLangue(e.target.value)}>
                <option value="fr">Français</option>
                <option value="mg">Malgache</option>
                <option value="en">Anglais</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={estPremium}
                  onChange={(e) => setEstPremium(e.target.checked)}
                />{" "}
                Cours premium (payant)
              </label>
              {estPremium && (
                <input
                  type="number"
                  placeholder="Prix en Ariary"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  min="0"
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Image de couverture</label>
            <label className="file-upload-label" htmlFor="thumbnail-file">
              <FiUpload size={18} />
              {thumbnailFile ? thumbnailFile.name : "Choisir une image…"}
            </label>
            <input
              id="thumbnail-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            {preview && (
              <div className="thumbnail-preview">
                <img src={preview} alt="Aperçu" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/instructor" className="btn btn-outline">
              Annuler
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Création…" : "Créer le cours"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
