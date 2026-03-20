import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { FiCamera } from "react-icons/fi";

const REGIONS = ["Analamanga","Vakinankaratra","Itasy","Bongolava","Matsiatra Ambony","Amoron'i Mania","Vatovavy","Fitovinany","Ihorombe","Atsimo-Atsinanana","Atsinanana","Analanjirofo","Alaotra-Mangoro","Boeny","Sofia","Betsiboka","Melaky","Atsimo-Andrefana","Androy","Anosy","Menabe","Diana","Sava"];

export default function EditProfile() {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", ville: "", region: "" });
  const [preview, setPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setForm({ nom: user.nom || "", prenom: user.prenom || "", telephone: (user as any).telephone || "", ville: (user as any).ville || "", region: (user as any).region || "" });
      setPreview(user.photo_url || "");
    }
  }, [user]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setPhotoFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("photo", photoFile);
      const res = await api.put("/utilisateurs/profil", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (token) login(token, res.data.user);
      setSuccess("Profil mis à jour avec succès !");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Modifier le profil</h1>
      </div>
      <div className="form-card">
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="photo-upload" onClick={() => fileRef.current?.click()}>
          <img src={preview || `https://ui-avatars.com/api/?name=${form.prenom}+${form.nom}&background=7B5EA7&color=fff&size=120`}
            alt="Photo" className="profile-avatar" />
          <div className="photo-overlay"><FiCamera size={20} /></div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Nom</label><input value={form.nom} onChange={set("nom")} required /></div>
            <div className="form-group"><label>Prénom</label><input value={form.prenom} onChange={set("prenom")} required /></div>
          </div>
          <div className="form-group"><label>Téléphone</label><input value={form.telephone} onChange={set("telephone")} placeholder="034 XX XXX XX" /></div>
          <div className="form-row">
            <div className="form-group"><label>Ville</label><input value={form.ville} onChange={set("ville")} /></div>
            <div className="form-group">
              <label>Région</label>
              <select value={form.region} onChange={set("region")}>
                <option value="">-- Choisir --</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
