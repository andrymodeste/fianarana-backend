import { useEffect, useState } from "react";
import api from "../../api/axios";
import CourseCard from "./CourseCard";
import CourseFilters from "./CourseFilters";
import type { Cours } from "../../types";

const defaultFilters = { search: "", matiere_id: "", niveau_id: "", langue: "", gratuit: false };

export default function CourseList() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filters.search)     params.search     = filters.search;
    if (filters.matiere_id) params.matiere_id = filters.matiere_id;
    if (filters.niveau_id)  params.niveau_id  = filters.niveau_id;
    if (filters.langue)     params.langue     = filters.langue;
    if (filters.gratuit)    params.gratuit    = "1";
    api.get("/cours", { params }).then(r => setCourses(r.data?.cours || [])).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tous les cours</h1>
        <p className="page-subtitle">{courses.length} cours disponibles</p>
      </div>
      <CourseFilters filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <p>Aucun cours trouvé pour ces critères.</p>
          <button className="btn btn-outline" onClick={() => setFilters(defaultFilters)}>Réinitialiser les filtres</button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => <CourseCard key={c.id} cours={c} />)}
        </div>
      )}
    </div>
  );
}
