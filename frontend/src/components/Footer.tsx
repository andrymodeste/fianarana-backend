import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Fianarana</h4>
            <p>Plateforme éducative malgache pour démocratiser l'accès à une éducation de qualité pour tous.</p>
          </div>
          <div className="footer-col">
            <h5>Apprendre</h5>
            <ul>
              <li><Link to="/courses">Tous les cours</Link></li>
              <li><Link to="/pricing">Abonnements</Link></li>
              <li><Link to="/dashboard">Mon apprentissage</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Enseigner</h5>
            <ul>
              <li><Link to="/instructor">Devenir professeur</Link></li>
              <li><Link to="/instructor/create-course">Créer un cours</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Compte</h5>
            <ul>
              <li><Link to="/login">Se connecter</Link></li>
              <li><Link to="/register">S'inscrire</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Fianarana. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
