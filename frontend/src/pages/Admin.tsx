import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Categorie, Matiere, Niveau } from "../types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

// ── Modal générique ──
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"categories" | "matieres" | "niveaux">("categories");

  // ── Catégories ──
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Categorie | null>(null);
  const [catForm, setCatForm] = useState({ nom: "", description: "", icone_url: "", ordre: 0 });

  // ── Matières ──
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [showMatModal, setShowMatModal] = useState(false);
  const [editingMat, setEditingMat] = useState<Matiere | null>(null);
  const [matForm, setMatForm] = useState({ categorie_id: 0, nom: "", description: "", couleur: "#7B5EA7", icone_url: "" });

  // ── Niveaux ──
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [showNivModal, setShowNivModal] = useState(false);
  const [editingNiv, setEditingNiv] = useState<Niveau | null>(null);
  const [nivForm, setNivForm] = useState({ nom: "", description: "", ordre: 0 });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (user?.role !== "admin") { navigate("/"); return; }
    loadAll();
  }, [isAuthenticated, navigate, user]);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/categories"),
      api.get("/categories/matieres"),
      api.get("/niveaux"),
    ]).then(([catRes, matRes, nivRes]) => {
      setCategories(catRes.data?.categories || []);
      setMatieres(matRes.data?.matieres || []);
      setNiveaux(nivRes.data?.niveaux || []);
    }).finally(() => setLoading(false));
  };

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // ══════════════════════ CATÉGORIES ══════════════════════

  const openCatModal = (cat?: Categorie) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ nom: cat.nom, description: cat.description || "", icone_url: cat.icone_url || "", ordre: cat.ordre });
    } else {
      setEditingCat(null);
      setCatForm({ nom: "", description: "", icone_url: "", ordre: categories.length + 1 });
    }
    setError("");
    setShowCatModal(true);
  };

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, catForm);
        flash("Catégorie mise à jour");
      } else {
        await api.post("/categories", catForm);
        flash("Catégorie créée");
      }
      setShowCatModal(false);
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  const deleteCat = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      await api.delete(`/categories/${id}`);
      flash("Catégorie supprimée");
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible de supprimer");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ══════════════════════ MATIÈRES ══════════════════════

  const openMatModal = (mat?: Matiere) => {
    if (mat) {
      setEditingMat(mat);
      setMatForm({ categorie_id: mat.categorie_id, nom: mat.nom, description: mat.description || "", couleur: mat.couleur || "#7B5EA7", icone_url: mat.icone_url || "" });
    } else {
      setEditingMat(null);
      setMatForm({ categorie_id: categories[0]?.id || 0, nom: "", description: "", couleur: "#7B5EA7", icone_url: "" });
    }
    setError("");
    setShowMatModal(true);
  };

  const saveMat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingMat) {
        await api.put(`/categories/matiere/${editingMat.id}`, matForm);
        flash("Matière mise à jour");
      } else {
        await api.post("/categories/matieres", matForm);
        flash("Matière créée");
      }
      setShowMatModal(false);
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  const deleteMat = async (id: number) => {
    if (!confirm("Supprimer cette matière ?")) return;
    try {
      await api.delete(`/categories/matiere/${id}`);
      flash("Matière supprimée");
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible de supprimer");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ══════════════════════ NIVEAUX ══════════════════════

  const openNivModal = (niv?: Niveau) => {
    if (niv) {
      setEditingNiv(niv);
      setNivForm({ nom: niv.nom, description: niv.description || "", ordre: niv.ordre });
    } else {
      setEditingNiv(null);
      setNivForm({ nom: "", description: "", ordre: niveaux.length + 1 });
    }
    setError("");
    setShowNivModal(true);
  };

  const saveNiv = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingNiv) {
        await api.put(`/niveaux/${editingNiv.id}`, nivForm);
        flash("Niveau mis à jour");
      } else {
        await api.post("/niveaux", nivForm);
        flash("Niveau créé");
      }
      setShowNivModal(false);
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  const deleteNiv = async (id: number) => {
    if (!confirm("Supprimer ce niveau ?")) return;
    try {
      await api.delete(`/niveaux/${id}`);
      flash("Niveau supprimé");
      loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Impossible de supprimer");
      setTimeout(() => setError(""), 3000);
    }
  };

  // ══════════════════════ RENDER ══════════════════════

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-inner">
        <div className="admin-header">
          <h1>Administration</h1>
          <p>Gérez les catégories, matières et niveaux de la plateforme.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            Catégories ({categories.length})
          </button>
          <button className={`admin-tab ${activeTab === "matieres" ? "active" : ""}`} onClick={() => setActiveTab("matieres")}>
            Matières ({matieres.length})
          </button>
          <button className={`admin-tab ${activeTab === "niveaux" ? "active" : ""}`} onClick={() => setActiveTab("niveaux")}>
            Niveaux ({niveaux.length})
          </button>
        </div>

        {/* ── TAB CATÉGORIES ── */}
        {activeTab === "categories" && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Catégories</h2>
              <button className="btn btn-primary" onClick={() => openCatModal()}><FiPlus /> Nouvelle catégorie</button>
            </div>
            {categories.length === 0 ? (
              <p className="muted">Aucune catégorie. Créez la première.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Ordre</th><th>Nom</th><th>Description</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.ordre}</td>
                      <td><strong>{cat.nom}</strong></td>
                      <td>{cat.description || "—"}</td>
                      <td className="actions-cell">
                        <button className="btn-icon" onClick={() => openCatModal(cat)} title="Modifier"><FiEdit2 /></button>
                        <button className="btn-icon btn-icon-danger" onClick={() => deleteCat(cat.id)} title="Supprimer"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB MATIÈRES ── */}
        {activeTab === "matieres" && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Matières</h2>
              <button className="btn btn-primary" onClick={() => openMatModal()}><FiPlus /> Nouvelle matière</button>
            </div>
            {matieres.length === 0 ? (
              <p className="muted">Aucune matière. Créez d'abord une catégorie, puis une matière.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Nom</th><th>Catégorie</th><th>Couleur</th><th>Description</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {matieres.map((mat) => (
                    <tr key={mat.id}>
                      <td><strong>{mat.nom}</strong></td>
                      <td>{mat.categorie_nom || "—"}</td>
                      <td>{mat.couleur ? <span className="color-dot" style={{ background: mat.couleur }}></span> : "—"}</td>
                      <td>{mat.description || "—"}</td>
                      <td className="actions-cell">
                        <button className="btn-icon" onClick={() => openMatModal(mat)} title="Modifier"><FiEdit2 /></button>
                        <button className="btn-icon btn-icon-danger" onClick={() => deleteMat(mat.id)} title="Supprimer"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB NIVEAUX ── */}
        {activeTab === "niveaux" && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Niveaux</h2>
              <button className="btn btn-primary" onClick={() => openNivModal()}><FiPlus /> Nouveau niveau</button>
            </div>
            {niveaux.length === 0 ? (
              <p className="muted">Aucun niveau. Créez le premier.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Ordre</th><th>Nom</th><th>Description</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {niveaux.map((niv) => (
                    <tr key={niv.id}>
                      <td>{niv.ordre}</td>
                      <td><strong>{niv.nom}</strong></td>
                      <td>{niv.description || "—"}</td>
                      <td className="actions-cell">
                        <button className="btn-icon" onClick={() => openNivModal(niv)} title="Modifier"><FiEdit2 /></button>
                        <button className="btn-icon btn-icon-danger" onClick={() => deleteNiv(niv.id)} title="Supprimer"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ══════ MODALS ══════ */}

      {showCatModal && (
        <Modal title={editingCat ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={() => setShowCatModal(false)}>
          <form onSubmit={saveCat} className="modal-form">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Nom *</label>
              <input type="text" value={catForm.nom} onChange={(e) => setCatForm({ ...catForm, nom: e.target.value })} required placeholder="Ex: Sciences" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={3} placeholder="Description de la catégorie" />
            </div>
            <div className="form-group">
              <label>Ordre d'affichage</label>
              <input type="number" value={catForm.ordre} onChange={(e) => setCatForm({ ...catForm, ordre: Number(e.target.value) })} min={0} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowCatModal(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">{editingCat ? "Mettre à jour" : "Créer"}</button>
            </div>
          </form>
        </Modal>
      )}

      {showMatModal && (
        <Modal title={editingMat ? "Modifier la matière" : "Nouvelle matière"} onClose={() => setShowMatModal(false)}>
          <form onSubmit={saveMat} className="modal-form">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Catégorie *</label>
              <select value={matForm.categorie_id} onChange={(e) => setMatForm({ ...matForm, categorie_id: Number(e.target.value) })} required>
                <option value={0} disabled>Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input type="text" value={matForm.nom} onChange={(e) => setMatForm({ ...matForm, nom: e.target.value })} required placeholder="Ex: Mathématiques" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={matForm.description} onChange={(e) => setMatForm({ ...matForm, description: e.target.value })} rows={3} placeholder="Description de la matière" />
            </div>
            <div className="form-group">
              <label>Couleur</label>
              <input type="color" value={matForm.couleur} onChange={(e) => setMatForm({ ...matForm, couleur: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowMatModal(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">{editingMat ? "Mettre à jour" : "Créer"}</button>
            </div>
          </form>
        </Modal>
      )}

      {showNivModal && (
        <Modal title={editingNiv ? "Modifier le niveau" : "Nouveau niveau"} onClose={() => setShowNivModal(false)}>
          <form onSubmit={saveNiv} className="modal-form">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Nom *</label>
              <input type="text" value={nivForm.nom} onChange={(e) => setNivForm({ ...nivForm, nom: e.target.value })} required placeholder="Ex: 6ème" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={nivForm.description} onChange={(e) => setNivForm({ ...nivForm, description: e.target.value })} rows={3} placeholder="Description du niveau" />
            </div>
            <div className="form-group">
              <label>Ordre d'affichage *</label>
              <input type="number" value={nivForm.ordre} onChange={(e) => setNivForm({ ...nivForm, ordre: Number(e.target.value) })} min={1} required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setShowNivModal(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">{editingNiv ? "Mettre à jour" : "Créer"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
