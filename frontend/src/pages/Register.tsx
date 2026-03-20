import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "eleve",
    telephone: "",
    ville: "",
    region: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        password: form.password,
        role: form.role,
        telephone: form.telephone || undefined,
        ville: form.ville || undefined,
        region: form.region || undefined,
      });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">Fianarana</Link>
          <h1>Créer un compte</h1>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                id="nom"
                type="text"
                name="nom"
                placeholder="Votre nom"
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                placeholder="Votre prénom"
                value={form.prenom}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="email@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telephone">Téléphone (optionnel)</label>
            <input
              id="telephone"
              type="tel"
              name="telephone"
              placeholder="+261 34 00 000 00"
              value={form.telephone}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ville">Ville (optionnel)</label>
              <input
                id="ville"
                type="text"
                name="ville"
                placeholder="Antananarivo"
                value={form.ville}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="region">Région (optionnel)</label>
              <input
                id="region"
                type="text"
                name="region"
                placeholder="Analamanga"
                value={form.region}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Au moins 6 caractères"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Répétez le mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Je veux</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="eleve">Apprendre (Élève)</option>
              <option value="professeur">Enseigner (Professeur)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Inscription..." : "Créer mon compte"}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Déjà un compte ?{" "}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
