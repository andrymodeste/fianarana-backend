import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Cours } from "../types";
import { FiPlus, FiBookOpen, FiUsers } from "react-icons/fi";

export default function Instructor() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== "professeur") {
      navigate("/");
      return;
    }
    api.get("/cours/mes-cours")
      .then((res) => {
        setCourses(res.data?.cours || res.data || []);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate, user]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="instructor-page">
      <div className="instructor-inner">
        <div className="instructor-header">
          <div>
            <h1>Espace professeur</h1>
            <p>Gérez vos cours et suivez vos statistiques.</p>
          </div>
          <Link to="/instructor/create-course" className="btn btn-primary">
            <FiPlus /> Nouveau cours
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dash-stat">
            <FiBookOpen size={28} />
            <div>
              <strong>{courses.length}</strong>
              <span>Cours créés</span>
            </div>
          </div>
          <div className="dash-stat">
            <FiUsers size={28} />
            <div>
              <strong>—</strong>
              <span>Élèves inscrits</span>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="dashboard-section">
          <h2>Mes cours</h2>
          {courses.length === 0 ? (
            <div className="empty-state">
              <FiBookOpen size={48} />
              <h3>Vous n'avez pas encore de cours</h3>
              <p>Créez votre premier cours et partagez votre expertise.</p>
              <Link to="/instructor/create-course" className="btn btn-primary">
                <FiPlus /> Créer un cours
              </Link>
            </div>
          ) : (
            <div className="instructor-courses">
              {courses.map((course) => {
                const imgSrc = course.image_url
                  ? (course.image_url.startsWith("/uploads/") ? `http://localhost:5000${course.image_url}` : course.image_url)
                  : `https://picsum.photos/seed/${course.id}/120/68`;
                return (
                  <div key={course.id} className="instructor-course-item">
                    <img src={imgSrc} alt={course.titre} />
                    <div className="instructor-course-info">
                      <h4>{course.titre}</h4>
                      <p>{course.description?.slice(0, 100)}...</p>
                      <div>
                        {course.matiere_nom && <span className="badge badge-purple">{course.matiere_nom}</span>}
                        {course.niveau_nom && <span className="badge badge-gray">{course.niveau_nom}</span>}
                      </div>
                    </div>
                    <div className="instructor-course-actions">
                      <Link to={`/courses/${course.id}`} className="btn btn-outline btn-sm">
                        Voir
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
