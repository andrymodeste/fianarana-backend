import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlay, FiBookOpen, FiMonitor, FiHeadphones, FiArrowRight } from "react-icons/fi";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";
import type { Cours, Categorie } from "../types";
import heroImg from "../assets/hero.png";
import etudier1 from "../assets/etudier1.jpg";
import etudier2 from "../assets/etudier2.jpg";

export default function Home() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/cours").then((res) => setCourses(res.data?.cours || res.data || [])).catch(() => {});
    api.get("/categories").then((res) => setCategories(res.data?.categories || [])).catch(() => {});
  }, []);

  const categoryNames = ["Toutes", ...categories.map(c => c.nom)];

  const featuredCourses = courses.slice(0, 8);

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero-v2">
        <div className="hero-v2-inner">
          <div className="hero-v2-content">
            <h1 className="hero-v2-title">
              Apprenez avec les<br />
              meilleurs professeurs<br />
              de Madagascar
            </h1>
            <p className="hero-v2-subtitle">
              Accédez à des cours de qualité adaptés au programme scolaire malgache.
              Apprenez à votre rythme, où que vous soyez, même sans connexion.
            </p>
            <div className="hero-v2-actions">
              <Link to="/register" className="btn btn-dark">Commencer gratuitement</Link>
              <button className="hero-play-btn" onClick={() => navigate("/courses")}>
                <span className="hero-play-circle"><FiPlay size={14} /></span>
                Comment ça marche ?
              </button>
            </div>

            {/* Floating stat cards */}
            <div className="hero-stats">
              <div className="hero-stat-card hero-stat-yellow">
                <span className="hero-stat-number">110K</span>
                <span className="hero-stat-label">Élèves actifs</span>
              </div>
              <div className="hero-stat-card hero-stat-white">
                <span className="hero-stat-number">100+</span>
                <span className="hero-stat-label">Cours disponibles</span>
                <div className="hero-stat-avatars">
                  <img src={etudier1} alt="" />
                  <img src={etudier2} alt="" />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-v2-image">
            <img src={heroImg} alt="Étudiants qui apprennent" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="features-inner">
          <div className="feature-card feature-yellow">
            <div className="feature-icon-box feature-icon-yellow">
              <FiBookOpen size={24} />
            </div>
            <h4>Meilleurs professeurs</h4>
            <p>Des enseignants certifiés et expérimentés de tout Madagascar.</p>
          </div>
          <div className="feature-card feature-purple">
            <div className="feature-icon-box feature-icon-purple">
              <FiMonitor size={24} />
            </div>
            <h4>Mode hors-ligne</h4>
            <p>Téléchargez les cours et apprenez même sans connexion internet.</p>
          </div>
          <div className="feature-card feature-blue">
            <div className="feature-icon-box feature-icon-blue">
              <FiHeadphones size={24} />
            </div>
            <h4>Support personnalisé</h4>
            <p>Messagerie directe avec vos professeurs pour un suivi individualisé.</p>
          </div>
        </div>
      </section>

      {/* ── POPULAR COURSES ── */}
      <section className="popular-section">
        <div className="popular-inner">
          <h2 className="popular-title">Nos cours populaires</h2>

          {/* Category tabs */}
          <div className="category-tabs">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat !== "Toutes") navigate(`/courses?search=${cat}`);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Courses grid */}
          {featuredCourses.length === 0 ? (
            <div className="empty-state">
              <p>Aucun cours disponible pour le moment.</p>
              <Link to="/courses" className="btn btn-dark">Explorer les cours</Link>
            </div>
          ) : (
            <div className="courses-grid">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="popular-cta">
            <Link to="/courses" className="btn btn-outline-dark">
              Voir tous les cours <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
