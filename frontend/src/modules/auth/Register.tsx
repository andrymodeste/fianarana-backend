import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const REGIONS = ["Analamanga","Vakinankaratra","Itasy","Bongolava","Matsiatra Ambony","Amoron'i Mania","Vatovavy","Fitovinany","Ihorombe","Atsimo-Atsinanana","Atsinanana","Analanjirofo","Alaotra-Mangoro","Boeny","Sofia","Betsiboka","Melaky","Atsimo-Andrefana","Androy","Anosy","Menabe","Diana","Sava"];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "", confirmPassword: "", role: "eleve", telephone: "", ville: "", region: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Les mots de passe ne correspondent pas");
    if (form.password.length < 6) return setError("Le mot de passe doit faire au moins 6 caractères");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user);
      navigate(form.role === "professeur" ? "/professeur" : "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo"><span className="logo-text">Fianarana</span></div>
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez des milliers d'apprenants malgaches.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <input type="text" placeholder="Rakoto" value={form.nom} onChange={set("nom")} required />
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input type="text" placeholder="Jean" value={form.prenom} onChange={set("prenom")} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="votre@email.com" value={form.email} onChange={set("email")} required />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input type="tel" placeholder="034 XX XXX XX" value={form.telephone} onChange={set("telephone")} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ville</label>
              <input type="text" placeholder="Antananarivo" value={form.ville} onChange={set("ville")} />
            </div>
            <div className="form-group">
              <label>Région</label>
              <select value={form.region} onChange={set("region")}>
                <option value="">-- Choisir --</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Je suis *</label>
            <div className="role-selector">
              {[{ val: "eleve", label: "Élève / Étudiant" }, { val: "professeur", label: "Professeur" }].map(r => (
                <label key={r.val} className={`role-option ${form.role === r.val ? "active" : ""}`}>
                  <input type="radio" name="role" value={r.val} checked={form.role === r.val} onChange={set("role")} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mot de passe *</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            <div className="form-group">
              <label>Confirmer *</label>
              <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
        <p className="auth-switch">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </div>
  );
}
