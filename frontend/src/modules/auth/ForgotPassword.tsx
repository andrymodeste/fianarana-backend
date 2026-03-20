import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/mot-de-passe-oublie", { email });
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-text">Fianarana</span></div>
        <h1 className="auth-title">Réinitialiser le mot de passe</h1>
        {status === "sent" ? (
          <div>
            <div className="alert alert-success">Un email de réinitialisation a été envoyé à <strong>{email}</strong>.</div>
            <p className="auth-switch"><Link to="/connexion">Retour à la connexion</Link></p>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            {status === "error" && <div className="alert alert-error">Aucun compte trouvé avec cet email.</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="votre@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
            </form>
            <p className="auth-switch"><Link to="/connexion">Retour à la connexion</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
