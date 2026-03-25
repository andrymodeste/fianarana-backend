import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { FiEdit2, FiAward, FiBookOpen, FiStar, FiPhone, FiMapPin } from "react-icons/fi";
import { photoUrl } from "../../utils/photoUrl";
import type { Badge, Certificat, Inscription, User } from "../../types";

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState({ cours: 0, badges: 0, certificats: 0, scoresMoyen: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certificats, setCertificats] = useState<Certificat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/utilisateurs/profil").catch(() => ({ data: { user: null } })),
      api.get("/badges/mes-badges").catch(() => ({ data: { badges: [] } })),
      api.get("/certificats").catch(() => ({ data: { certificats: [] } })),
      api.get("/inscriptions/mes-cours").catch(() => ({ data: { cours: [] } })),
    ]).then(([p, b, c, ins]) => {
      setProfile(p.data?.user || authUser);
      setBadges(b.data?.badges || []);
      setCertificats(c.data?.certificats || []);
      const cours = ins.data?.cours || [];
      setStats({ cours: cours.length, badges: (b.data?.badges || []).length, certificats: (c.data?.certificats || []).length, scoresMoyen: 0 });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const user = profile || authUser;

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img src={photoUrl(user?.photo_url) || `https://ui-avatars.com/api/?name=${user?.prenom}+${user?.nom}&background=7B5EA7&color=fff&size=120`}
            alt="Photo" className="profile-avatar" />
        </div>
        <div className="profile-info">
          <h1>{user?.prenom} {user?.nom}</h1>
          <p className="profile-role">{user?.role === "eleve" ? "Élève" : user?.role === "professeur" ? "Professeur" : "Administrateur"}</p>
          <p className="profile-email">{user?.email}</p>
          {user?.telephone && <p className="profile-detail"><FiPhone size={14} /> {user.telephone}</p>}
          {(user?.ville || user?.region) && <p className="profile-detail"><FiMapPin size={14} /> {[user.ville, user.region].filter(Boolean).join(", ")}</p>}
          <Link to="/profil/modifier" className="btn btn-outline btn-sm"><FiEdit2 size={14} /> Modifier le profil</Link>
        </div>
      </div>

      <div className="stats-row">
        {[{ icon: <FiBookOpen />, val: stats.cours, label: "Cours suivis" },
          { icon: <FiAward />, val: stats.badges, label: "Badges" },
          { icon: <FiStar />, val: stats.certificats, label: "Certificats" }
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="profile-sections">
        <section className="profile-section">
          <h2>Mes badges</h2>
          {badges.length === 0 ? <p className="empty-msg">Aucun badge pour l'instant.</p> : (
            <div className="badges-grid">
              {badges.map(b => (
                <div key={b.id} className="badge-item" title={b.description}>
                  <div className="badge-icon">{b.icone_url ? <img src={b.icone_url} alt={b.nom} /> : "🏆"}</div>
                  <span>{b.nom}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2>Mes certificats</h2>
          {certificats.length === 0 ? <p className="empty-msg">Aucun certificat pour l'instant.</p> : (
            <div className="certificats-list">
              {certificats.map(c => (
                <div key={c.id} className="certificat-card">
                  <FiAward size={24} />
                  <div>
                    <div className="cert-titre">{c.cours_titre}</div>
                    <div className="cert-date">Délivré le {new Date(c.delivre_le).toLocaleDateString("fr-FR")}</div>
                    <div className="cert-code">Code: {c.code_verification}</div>
                  </div>
                  {c.fichier_url && <a href={c.fichier_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">Télécharger</a>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
