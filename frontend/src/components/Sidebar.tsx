import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { photoUrl } from "../utils/photoUrl";
import {
  FiGrid, FiBook, FiMessageSquare, FiAward, FiClock,
  FiCreditCard, FiUser, FiEdit2, FiLock, FiLogOut,
  FiPlusCircle, FiBriefcase, FiUsers, FiCheckSquare,
  FiFolder, FiStar, FiBell, FiChevronLeft, FiChevronRight, FiAlertCircle
} from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [profVerified, setProfVerified] = useState<boolean | null>(null);

  const handleLogout = () => { logout(); navigate("/"); };
  const role = user?.role;

  // Vérifier le statut de vérification du professeur
  useEffect(() => {
    if (role !== "professeur") return;
    api.get("/professeurs/mon-profil")
      .then(r => setProfVerified(r.data?.profil?.est_verifie === 1))
      .catch(() => setProfVerified(false));
  }, [role]);

  const isProf = role === "professeur";
  const profBlocked = isProf && profVerified === false;

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.photo_url
              ? <img src={photoUrl(user.photo_url)} alt="" />
              : <span>{user?.prenom?.charAt(0).toUpperCase()}</span>}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <strong>{user?.prenom} {user?.nom}</strong>
              <span className="sidebar-role">
                {role === "eleve" ? "Élève" : role === "professeur" ? "Professeur" : "Administrateur"}
              </span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Ouvrir" : "Réduire"}>
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* ── Élève ── */}
        {role === "eleve" && (
          <>
            <div className="sidebar-section-label">{!collapsed && "Navigation"}</div>
            <NavLink to="/dashboard" className="sidebar-item"><FiGrid />{!collapsed && <span>Tableau de bord</span>}</NavLink>
            <NavLink to="/mes-cours" className="sidebar-item"><FiBook />{!collapsed && <span>Mes cours</span>}</NavLink>
            <NavLink to="/messages" className="sidebar-item"><FiMessageSquare />{!collapsed && <span>Messages</span>}</NavLink>
            <NavLink to="/badges" className="sidebar-item"><FiAward />{!collapsed && <span>Badges & Certificats</span>}</NavLink>
            <NavLink to="/quiz/historique" className="sidebar-item"><FiClock />{!collapsed && <span>Historique quiz</span>}</NavLink>
            <NavLink to="/abonnement" className="sidebar-item"><FiCreditCard />{!collapsed && <span>Abonnement</span>}</NavLink>

            <div className="sidebar-divider" />
            <div className="sidebar-section-label">{!collapsed && "Compte"}</div>
            <NavLink to="/profil" end className="sidebar-item"><FiUser />{!collapsed && <span>Mon profil</span>}</NavLink>
            <NavLink to="/profil/modifier" className="sidebar-item"><FiEdit2 />{!collapsed && <span>Modifier le profil</span>}</NavLink>
            <NavLink to="/profil/mot-de-passe" className="sidebar-item"><FiLock />{!collapsed && <span>Mot de passe</span>}</NavLink>
          </>
        )}

        {/* ── Professeur ── */}
        {isProf && (
          <>
            <div className="sidebar-section-label">{!collapsed && "Enseignement"}</div>
            <NavLink to="/professeur" end className="sidebar-item"><FiGrid />{!collapsed && <span>Tableau de bord</span>}</NavLink>

            {profBlocked ? (
              <>
                {/* Liens désactivés avec badge d'avertissement */}
                <div className="sidebar-item disabled" title="En attente de vérification">
                  <FiPlusCircle />{!collapsed && <span>Nouveau cours</span>}
                </div>
                <NavLink to="/professeur/mon-profil" className="sidebar-item">
                  <FiBriefcase />{!collapsed && <span>Profil professionnel</span>}
                </NavLink>
                <div className="sidebar-item disabled" title="En attente de vérification">
                  <FiMessageSquare />{!collapsed && <span>Messages</span>}
                </div>
                {!collapsed && (
                  <div className="sidebar-verification-notice">
                    <FiAlertCircle size={14} />
                    <span>En attente de vérification</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <NavLink to="/professeur/nouveau-cours" className="sidebar-item"><FiPlusCircle />{!collapsed && <span>Nouveau cours</span>}</NavLink>
                <NavLink to="/professeur/mon-profil" className="sidebar-item"><FiBriefcase />{!collapsed && <span>Profil professionnel</span>}</NavLink>
                <NavLink to="/messages" className="sidebar-item"><FiMessageSquare />{!collapsed && <span>Messages</span>}</NavLink>
              </>
            )}

            <div className="sidebar-divider" />
            <div className="sidebar-section-label">{!collapsed && "Compte"}</div>
            <NavLink to="/profil" end className="sidebar-item"><FiUser />{!collapsed && <span>Mon profil</span>}</NavLink>
            <NavLink to="/profil/modifier" className="sidebar-item"><FiEdit2 />{!collapsed && <span>Modifier le profil</span>}</NavLink>
            <NavLink to="/profil/mot-de-passe" className="sidebar-item"><FiLock />{!collapsed && <span>Mot de passe</span>}</NavLink>
          </>
        )}

        {/* ── Admin ── */}
        {role === "admin" && (
          <>
            <div className="sidebar-section-label">{!collapsed && "Administration"}</div>
            <NavLink to="/admin" end className="sidebar-item"><FiGrid />{!collapsed && <span>Tableau de bord</span>}</NavLink>
            <NavLink to="/admin/utilisateurs" className="sidebar-item"><FiUsers />{!collapsed && <span>Utilisateurs</span>}</NavLink>
            <NavLink to="/admin/validation-cours" className="sidebar-item"><FiCheckSquare />{!collapsed && <span>Validation cours</span>}</NavLink>
            <NavLink to="/admin/validation-profs" className="sidebar-item"><FiBriefcase />{!collapsed && <span>Validation profs</span>}</NavLink>
            <NavLink to="/admin/catalogue" className="sidebar-item"><FiFolder />{!collapsed && <span>Catalogue</span>}</NavLink>
            <NavLink to="/admin/avis" className="sidebar-item"><FiStar />{!collapsed && <span>Modération avis</span>}</NavLink>
            <NavLink to="/admin/notifications" className="sidebar-item"><FiBell />{!collapsed && <span>Notifications</span>}</NavLink>

            <div className="sidebar-divider" />
            <div className="sidebar-section-label">{!collapsed && "Compte"}</div>
            <NavLink to="/profil" end className="sidebar-item"><FiUser />{!collapsed && <span>Mon profil</span>}</NavLink>
            <NavLink to="/profil/modifier" className="sidebar-item"><FiEdit2 />{!collapsed && <span>Modifier le profil</span>}</NavLink>
            <NavLink to="/profil/mot-de-passe" className="sidebar-item"><FiLock />{!collapsed && <span>Mot de passe</span>}</NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        <button onClick={handleLogout} className="sidebar-item sidebar-logout">
          <FiLogOut />{!collapsed && <span>Se déconnecter</span>}
        </button>
      </div>
    </aside>
  );
}
