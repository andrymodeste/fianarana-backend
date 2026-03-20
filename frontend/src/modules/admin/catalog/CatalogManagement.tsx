import { useEffect, useState } from "react";
import api from "../../../api/axios";
import type { Categorie, Matiere, Niveau } from "../../../types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

type Tab = "categories" | "matieres" | "niveaux";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>{title}</h3><button onClick={onClose}><FiX /></button></div>
        {children}
      </div>
    </div>
  );
}

export default function CatalogManagement() {
  const [tab, setTab]           = useState<Tab>("categories");
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [matieres, setMatieres]     = useState<Matiere[]>([]);
  const [niveaux, setNiveaux]       = useState<Niveau[]>([]);
  const [modal, setModal]   = useState<{ type: Tab; item?: any } | null>(null);
  const [form, setForm]     = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  const load = () => {
    api.get("/categories").then(r => setCategories(r.data?.categories || []));
    api.get("/categories/matieres").then(r => setMatieres(r.data?.matieres || []));
    api.get("/niveaux").then(r => setNiveaux(r.data?.niveaux || []));
  };

  useEffect(() => { load(); }, []);

  const openCreate = (type: Tab) => { setForm({}); setModal({ type }); };
  const openEdit   = (type: Tab, item: any) => { setForm({ ...item }); setModal({ type, item }); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = !!modal?.item;
      if (modal?.type === "categories") {
        isEdit ? await api.put(`/categories/${form.id}`, form) : await api.post("/categories", form);
      } else if (modal?.type === "matieres") {
        isEdit ? await api.put(`/categories/matieres/${form.id}`, form) : await api.post("/categories/matieres", form);
      } else {
        isEdit ? await api.put(`/niveaux/${form.id}`, form) : await api.post("/niveaux", form);
      }
      load(); setModal(null); setMsg("Enregistré !");
      setTimeout(() => setMsg(""), 2000);
    } catch (err: any) { setMsg(err.response?.data?.message || "Erreur"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (type: Tab, id: number) => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      if (type === "categories") await api.delete(`/categories/${id}`);
      else if (type === "matieres") await api.delete(`/categories/matieres/${id}`);
      else await api.delete(`/niveaux/${id}`);
      load(); setMsg("Supprimé !");
      setTimeout(() => setMsg(""), 2000);
    } catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-container">
      <div className="page-header"><h1>Gestion du catalogue</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="tab-nav">
        {(["categories", "matieres", "niveaux"] as Tab[]).map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="section-header">
        <h2>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
        <button className="btn btn-primary btn-sm" onClick={() => openCreate(tab)}><FiPlus /> Ajouter</button>
      </div>

      {tab === "categories" && (
        <div className="catalog-list">
          {categories.map(c => (
            <div key={c.id} className="catalog-item">
              <span>{c.nom}</span>
              <div><button onClick={() => openEdit("categories", c)}><FiEdit2 /></button><button onClick={() => handleDelete("categories", c.id)}><FiTrash2 /></button></div>
            </div>
          ))}
        </div>
      )}
      {tab === "matieres" && (
        <div className="catalog-list">
          {matieres.map(m => (
            <div key={m.id} className="catalog-item">
              <span style={{ borderLeft: `4px solid ${m.couleur || "#ccc"}`, paddingLeft: 8 }}>{m.nom} <small>({m.categorie_nom})</small></span>
              <div><button onClick={() => openEdit("matieres", m)}><FiEdit2 /></button><button onClick={() => handleDelete("matieres", m.id)}><FiTrash2 /></button></div>
            </div>
          ))}
        </div>
      )}
      {tab === "niveaux" && (
        <div className="catalog-list">
          {niveaux.map(n => (
            <div key={n.id} className="catalog-item">
              <span>{n.nom}</span>
              <div><button onClick={() => openEdit("niveaux", n)}><FiEdit2 /></button><button onClick={() => handleDelete("niveaux", n.id)}><FiTrash2 /></button></div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={`${modal.item ? "Modifier" : "Créer"} ${modal.type.slice(0, -1)}`} onClose={() => setModal(null)}>
          <form onSubmit={handleSave}>
            <div className="form-group"><label>Nom *</label><input value={form.nom || ""} onChange={set("nom")} required /></div>
            {modal.type === "categories" && <div className="form-group"><label>Description</label><input value={form.description || ""} onChange={set("description")} /></div>}
            {modal.type === "matieres" && (
              <>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select value={form.categorie_id || ""} onChange={set("categorie_id")} required>
                    <option value="">-- Choisir --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Couleur</label><input type="color" value={form.couleur || "#7B5EA7"} onChange={set("couleur")} /></div>
              </>
            )}
            {modal.type === "niveaux" && <div className="form-group"><label>Ordre</label><input type="number" value={form.ordre || ""} onChange={set("ordre")} /></div>}
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "..." : "Enregistrer"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
