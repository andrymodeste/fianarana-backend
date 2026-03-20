import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Badge } from "../../types";

export default function BadgesPage() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [myBadges, setMyBadges]   = useState<Badge[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get("/badges"), api.get("/badges/mes-badges")])
      .then(([all, mine]) => { setAllBadges(all.data?.badges || []); setMyBadges(mine.data?.badges || []); })
      .finally(() => setLoading(false));
  }, []);

  const myIds = new Set(myBadges.map(b => b.id));

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mes badges</h1>
        <p>{myBadges.length} / {allBadges.length} badges obtenus</p>
      </div>
      <div className="badges-progress-bar">
        <div className="badges-progress-fill" style={{ width: `${allBadges.length ? (myBadges.length / allBadges.length) * 100 : 0}%` }} />
      </div>
      <div className="badges-grid-full">
        {allBadges.map(b => {
          const obtained = myIds.has(b.id);
          return (
            <div key={b.id} className={`badge-card ${obtained ? "obtained" : "locked"}`}>
              <div className="badge-icon-lg">{b.icone_url ? <img src={b.icone_url} alt={b.nom} /> : "🏆"}</div>
              <div className="badge-name">{b.nom}</div>
              <div className="badge-desc">{b.description}</div>
              {obtained ? (
                <div className="badge-obtained">Obtenu {b.obtenu_le ? `le ${new Date(b.obtenu_le).toLocaleDateString("fr-FR")}` : ""}</div>
              ) : (
                <div className="badge-condition">Condition : {b.condition_valeur} {b.type}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
