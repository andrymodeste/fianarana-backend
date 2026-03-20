import { useEffect, useState } from "react";
import api from "../../api/axios";

interface ProfilForm { bio: string; specialites: string; diplomes: string; experience_annees: number; tarif_heure: number; disponibilite: string; }
const empty: ProfilForm = { bio: "", specialites: "", diplomes: "", experience_annees: 0, tarif_heure: 0, disponibilite: "" };

export default function TeacherProfile() {
  const [form, setForm]     = useState<ProfilForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  useEffect(() => {
    api.get("/professeurs/mon-profil").then(r => { if (r.data?.profil) setForm({ bio: r.data.profil.bio || "", specialites: r.data.profil.specialites || "", diplomes: r.data.profil.diplomes || "", experience_annees: r.data.profil.experience_annees || 0, tarif_heure: r.data.profil.tarif_heure || 0, disponibilite: r.data.profil.disponibilite || "" }); })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try { await api.put("/professeurs/mon-profil", form); setMsg("Profil mis à jour !"); }
    catch { setMsg("Erreur lors de la mise à jour"); }
    finally { setSaving(false); }
  };

  const set = (k: keyof ProfilForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Mon profil professionnel</h1></div>
      <div className="form-card form-card-wide">
        {msg && <div className={`alert ${msg.includes("Erreur") ? "alert-error" : "alert-success"}`}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Biographie</label><textarea value={form.bio} onChange={set("bio")} rows={4} placeholder="Présentez-vous..." /></div>
          <div className="form-group"><label>Spécialités</label><input value={form.specialites} onChange={set("specialites")} placeholder="Ex: Mathématiques, Physique" /></div>
          <div className="form-group"><label>Diplômes</label><input value={form.diplomes} onChange={set("diplomes")} placeholder="Ex: Licence en Mathématiques - Université d'Antananarivo" /></div>
          <div className="form-row">
            <div className="form-group"><label>Années d'expérience</label><input type="number" value={form.experience_annees} onChange={set("experience_annees")} min="0" /></div>
            <div className="form-group"><label>Tarif horaire (Ar)</label><input type="number" value={form.tarif_heure} onChange={set("tarif_heure")} min="0" /></div>
          </div>
          <div className="form-group"><label>Disponibilités</label><textarea value={form.disponibilite} onChange={set("disponibilite")} rows={2} placeholder="Ex: Lundi-Vendredi 18h-20h, Weekend matin" /></div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
