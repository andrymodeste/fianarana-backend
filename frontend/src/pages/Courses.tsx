import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";
import type { Cours } from "../types";
import { FiSearch, FiLoader } from "react-icons/fi";

export default function Courses() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setLoading(true);
    api
      .get("/cours")
      .then((res) => setCourses(res.data?.cours || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const searchTerm = searchParams.get("search") || "";

  const filtered = courses.filter(
    (c) =>
      !searchTerm ||
      c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.matiere_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.niveau_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${c.professeur_prenom} ${c.professeur_nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="courses-page">
      <div className="courses-hero">
        <div className="courses-hero-inner">
          <h1>Tous les cours</h1>
          <form className="courses-search" onSubmit={handleSearch}>
            <FiSearch />
            <input
              type="text"
              placeholder="Rechercher un cours, une matière..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Rechercher</button>
          </form>
        </div>
      </div>

      <div className="courses-body">
        <div className="courses-results-info">
          {searchTerm ? (
            <p>
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} pour{" "}
              <strong>"{searchTerm}"</strong>
              <button
                className="clear-search"
                onClick={() => { setQuery(""); setSearchParams({}); }}
              >
                ✕ Effacer
              </button>
            </p>
          ) : (
            <p>{courses.length} cours disponibles</p>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <FiLoader className="spin" size={32} />
            <p>Chargement des cours...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Aucun cours trouvé pour "{searchTerm}"</p>
            <button className="btn btn-primary" onClick={() => { setQuery(""); setSearchParams({}); }}>
              Voir tous les cours
            </button>
          </div>
        ) : (
          <div className="courses-grid large">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
