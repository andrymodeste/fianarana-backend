import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Plan } from "../types";
import { FiCheck, FiZap } from "react-icons/fi";

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/plans")
      .then((res) => setPlans(res.data?.plans || res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSubscribing(planId);
    setError("");
    setSuccess("");
    try {
      await api.post("/abonnements/souscrire", { plan_id: planId });
      setSuccess("Abonnement souscrit avec succès !");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la souscription");
    } finally {
      setSubscribing(null);
    }
  };

  const FEATURES = [
    "Accès illimité à tous les cours",
    "Contenu mis à jour régulièrement",
    "Certificats de complétion",
    "Support prioritaire",
    "Téléchargement pour accès hors ligne",
    "Chat avec les professeurs",
  ];

  const getPlanFeatures = (plan: Plan) => {
    const count = plan.duree_jours <= 30 ? 3 : plan.duree_jours <= 90 ? 5 : 6;
    return FEATURES.slice(0, count);
  };

  const isPopular = (index: number) => index === 1;

  const formatPrice = (price: number) => {
    return price.toLocaleString("fr-FR") + " Ar";
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choisissez votre abonnement</h1>
        <p>Accédez à tous nos cours et développez vos compétences sans limite.</p>
      </div>

      {error && <div className="alert alert-error centered">{error}</div>}
      {success && <div className="alert alert-success centered">{success}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Chargement des plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <p>Aucun plan disponible pour le moment.</p>
        </div>
      ) : (
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`pricing-card ${isPopular(index) ? "popular" : ""}`}
            >
              {isPopular(index) && (
                <div className="popular-badge">
                  <FiZap /> Le plus populaire
                </div>
              )}
              <div className="pricing-card-header">
                <h3>{plan.nom}</h3>
                <div className="pricing-price">
                  <span className="price-amount">{formatPrice(plan.prix)}</span>
                  <span className="price-period">/ {plan.duree_jours} jours</span>
                </div>
                {plan.description && <p className="plan-description">{plan.description}</p>}
              </div>
              <ul className="plan-features">
                {getPlanFeatures(plan).map((feature) => (
                  <li key={feature}>
                    <FiCheck className="check-icon" /> {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`btn btn-full ${isPopular(index) ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribing === plan.id}
              >
                {subscribing === plan.id ? "Souscription..." : plan.prix === 0 ? "Commencer gratuitement" : "Commencer maintenant"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FAQ */}
      <div className="pricing-faq">
        <h2>Questions fréquentes</h2>
        <div className="faq-grid">
          {[
            {
              q: "Puis-je annuler à tout moment ?",
              a: "Oui, vous pouvez annuler votre abonnement à tout moment. Vous conservez l'accès jusqu'à la fin de la période payée.",
            },
            {
              q: "Quels moyens de paiement sont acceptés ?",
              a: "Nous acceptons MVola, Orange Money, Airtel Money et les cartes bancaires.",
            },
            {
              q: "Les cours sont-ils accessibles hors-ligne ?",
              a: "Oui, avec un abonnement premium vous pouvez télécharger les cours pour les consulter sans connexion internet.",
            },
            {
              q: "Puis-je obtenir un certificat ?",
              a: "Oui, chaque cours complété vous donne droit à un certificat de réussite numérique vérifiable.",
            },
          ].map((item) => (
            <div key={item.q} className="faq-item">
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
