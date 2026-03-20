import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Matiere, Niveau } from "../../types";

interface Filters {
  search: string; matiere_id: string; niveau_id: string;
  langue: string; gratuit: boolean;
}

interface Props { filters: Filters; onChange: (f: Filters) => void; }

export default function CourseFilters({ filters, onChange }: Props) {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);

  useEffect(() => {
    api.get("/categories/matieres").then(r => setMatieres(r.data?.matieres || [])).catch(() => {});
    api.get("/niveaux").then(r => setNiveaux(r.data?.niveaux || [])).catch(() => {});
  }, []);

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });

  const reset = () => onChange({ search: "", matiere_id: "", niveau_id: "", langue: "", gratuit: false });

  return (
    <div className="course-filters">
      <div className="filter-search">
        <input type="search" placeholder="Rechercher un cours..." value={filters.search} onChange={set("search")} className="search-input" />
      </div>
      <div className="filter-row">
        <select value={filters.matiere_id} onChange={set("matiere_id")}>
          <option value="">Toutes les matières</option>
          {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
        <select value={filters.niveau_id} onChange={set("niveau_id")}>
          <option value="">Tous les niveaux</option>
          {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
        </select>
        <select value={filters.langue} onChange={set("langue")}>
          <option value="">Toutes les langues</option>
          <option value="fr">Français</option>
          <option value="mg">Malgache</option>
          <option value="en">Anglais</option>
        </select>
        <label className="filter-check">
          <input type="checkbox" checked={filters.gratuit} onChange={set("gratuit")} />
          Cours gratuits uniquement
        </label>
        <button className="btn btn-outline btn-sm" onClick={reset}>Réinitialiser</button>
      </div>
    </div>
  );
}
