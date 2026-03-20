import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import type { Plan, Abonnement } from "../../types";
import { FiCheck, FiZap, FiCalendar } from "react-icons/fi";

export default function Plans() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans]           = useState<Plan[]>([]);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [loading, setLoading]       = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/plans"),
      isAuthenticated ? api.get("/abonnements/mon-abonnement").catch(() => ({ data: null })) : Promise.resolve({ data: null })
    ]).then(([p, a]) => {
      setPlans(p.data?.plans || p.data || []);
      setAbonnement(a.data?.abonnement || null);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSubscribe = async (planId: number) => {
    if (!isAuthenticated) return navigate("/connexion");
    setSubscribing(planId); setError(""); setSuccess("");
    try {
      await api.post("/abonnements", { plan_id: planId });
      const res = await api.get("/abonnements/mon-abonnement").catch(() => null);
      setAbonnement(res?.data?.abonnement || null);
      setSuccess("Abonnement activé avec succès !");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'abonnement");
    } finally { setSubscribing(null); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Plans d'abonnement</h1>
        <p className="page-subtitle">Accédez à tous les cours premium de Fianarana</p>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {abonnement && (
        <div className="current-plan-banner">
          <FiCalendar />
          <div>
            <strong>Abonnement actif : {abonnement.plan_nom}</strong>
            <span> · Expire le {new Date(abonnement.fin).toLocaleDateString("fr-FR")}</span>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.filter(p => p.est_actif).map(plan => {
          const features = plan.fonctionnalites ? JSON.parse(plan.fonctionnalites) as string[] : [];
          const isActive = abonnement?.plan_id === plan.id;
          return (
            <div key={plan.id} className={`plan-card ${plan.duree_jours >= 365 ? "plan-popular" : ""}`}>
              {plan.duree_jours >= 365 && <div className="plan-badge"><FiZap /> Populaire</div>}
              <h2 className="plan-name">{plan.nom}</h2>
              <div className="plan-price">
                <span className="plan-amount">{plan.prix.toLocaleString()}</span>
                <span className="plan-currency"> Ar</span>
                <span className="plan-period"> / {plan.duree_jours >= 365 ? "an" : "mois"}</span>
              </div>
              <p className="plan-desc">{plan.description}</p>
              <ul className="plan-features">
                {features.map((f, i) => <li key={i}><FiCheck /> {f}</li>)}
              </ul>
              {isActive ? (
                <button className="btn btn-outline btn-full" disabled>Plan actuel</button>
              ) : (
                <button className="btn btn-primary btn-full" onClick={() => handleSubscribe(plan.id)} disabled={subscribing === plan.id}>
                  {subscribing === plan.id ? "Traitement..." : "Souscrire"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="payment-methods">
        <h3>Moyens de paiement acceptés</h3>
        <div className="payment-logos">
          <span className="payment-badge">MVola</span>
          <span className="payment-badge">Orange Money</span>
          <span className="payment-badge">Airtel Money</span>
        </div>
        <p className="payment-note">Le paiement s'effectue par transfert mobile. Vous recevrez un SMS de confirmation.</p>
      </div>
    </div>
  );
}
