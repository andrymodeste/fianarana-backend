import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.newPassword !== form.confirmPassword) return setError("Les mots de passe ne correspondent pas");
    if (form.newPassword.length < 6) return setError("Le nouveau mot de passe doit faire au moins 6 caractères");
    setLoading(true);
    try {
      await api.put("/utilisateurs/changer-mot-de-passe", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess("Mot de passe changé avec succès !");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-container">
      <div className="page-header"><h1>Changer le mot de passe</h1></div>
      <div className="form-card" style={{ maxWidth: 480 }}>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mot de passe actuel</label>
            <input type="password" value={form.currentPassword} onChange={set("currentPassword")} required />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" value={form.newPassword} onChange={set("newPassword")} required />
          </div>
          <div className="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Changement..." : "Changer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
