import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiMessageSquare } from "react-icons/fi";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const fullName = user ? `${user.prenom} ${user.nom}` : "";

  const dashLink = user?.role === "admin" ? "/admin" : user?.role === "professeur" ? "/professeur" : "/dashboard";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Fianarana</Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">Accueil</Link>
          <Link to="/cours" className="navbar-link">Cours</Link>
          <Link to="/abonnement" className="navbar-link">Abonnements</Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/messages" className="navbar-icon-btn" title="Messages"><FiMessageSquare size={20} /></Link>
              <Link to="/profil" className="navbar-avatar-menu">
                <div className="navbar-avatar">
                  {user?.photo_url ? <img src={user.photo_url} alt="" /> : user?.prenom?.charAt(0).toUpperCase()}
                </div>
                <div className="navbar-dropdown">
                  <div className="dropdown-header">
                    <strong>{fullName}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <hr />
                  <Link to={dashLink} className="dropdown-item">Tableau de bord</Link>
                  <Link to="/mes-cours" className="dropdown-item">Mes cours</Link>
                  <Link to="/messages" className="dropdown-item">Messages</Link>
                  <Link to="/badges" className="dropdown-item">Badges & Certificats</Link>
                  {user?.role === "professeur" && <Link to="/professeur/mon-profil" className="dropdown-item">Profil professionnel</Link>}
                  {user?.role === "admin" && <Link to="/admin" className="dropdown-item">Administration</Link>}
                  <hr />
                  <Link to="/profil/modifier" className="dropdown-item">Modifier le profil</Link>
                  <Link to="/profil/mot-de-passe" className="dropdown-item">Changer le mot de passe</Link>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">Se déconnecter</button>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/connexion" className="navbar-signin">Se connecter</Link>
              <Link to="/inscription" className="btn btn-dark">Commencer</Link>
            </>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMobileOpen(false)}>Accueil</Link>
          <Link to="/cours" className="mobile-link" onClick={() => setMobileOpen(false)}>Cours</Link>
          <Link to="/abonnement" className="mobile-link" onClick={() => setMobileOpen(false)}>Abonnements</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashLink} className="mobile-link" onClick={() => setMobileOpen(false)}>Tableau de bord</Link>
              <Link to="/mes-cours" className="mobile-link" onClick={() => setMobileOpen(false)}>Mes cours</Link>
              <Link to="/messages" className="mobile-link" onClick={() => setMobileOpen(false)}>Messages</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="mobile-link logout-btn">Se déconnecter</button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="mobile-link" onClick={() => setMobileOpen(false)}>Se connecter</Link>
              <Link to="/inscription" className="mobile-link mobile-cta" onClick={() => setMobileOpen(false)}>Commencer</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
