import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ReviewList from "../reviews/ReviewList";
import type { Cours, Lecon, Avis } from "../../types";
import { FiStar, FiClock, FiUsers, FiPlay, FiLock, FiDownload } from "react-icons/fi";
import { photoUrl } from "../../utils/photoUrl";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse]   = useState<Cours | null>(null);
  const [lecons, setLecons]   = useState<Lecon[]>([]);
  const [avis, setAvis]       = useState<Avis[]>([]);
  const [avgNote, setAvgNote] = useState(0);
  const [enrolled, setEnrolled]   = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/cours/${id}`),
      api.get(`/lecons/cours/${id}`),
      api.get(`/avis/cours/${id}`),
      isAuthenticated ? api.get("/inscriptions/mes-cours").catch(() => ({ data: { cours: [] } })) : Promise.resolve({ data: { cours: [] } })
    ]).then(([c, l, a, ins]) => {
      setCourse(c.data.cours);
      setLecons(l.data?.lecons || []);
      setAvis(a.data?.avis || []);
      setAvgNote(a.data?.moyenne || 0);
      const enrolled = (ins.data?.cours || []).some((i: any) => i.cours_id === Number(id));
      setEnrolled(enrolled);
    }).catch(() => navigate("/cours")).finally(() => setLoading(false));
  }, [id, isAuthenticated, navigate]);

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate("/connexion");
    setEnrolling(true);
    try {
      await api.post("/inscriptions/inscrire", { cours_id: Number(id) });
      setEnrolled(true);
    } catch (err: any) {
      if (err.response?.status === 400) setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!course) return <div className="page-container"><p>Cours introuvable.</p></div>;

  return (
    <div className="course-detail-page">
      <div className="course-detail-hero">
        <div className="course-detail-info">
          {course.matiere_nom && <span className="course-matiere">{course.matiere_nom}</span>}
          <h1>{course.titre}</h1>
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <span><FiStar /> {parseFloat(String(avgNote)).toFixed(1)} ({avis.length} avis)</span>
            <span><FiUsers /> {course.nb_inscrits || 0} inscrits</span>
            <span><FiPlay /> {course.nombre_lecons || 0} leçons</span>
            {course.duree_totale_minutes ? <span><FiClock /> {course.duree_totale_minutes} min</span> : null}
          </div>
          <p className="course-prof-name">Par <Link to={`/professeur/${course.professeur_id}`}>{course.professeur_prenom} {course.professeur_nom}</Link></p>
          <p className="course-niveau">{course.niveau_nom} • {course.langue === "fr" ? "Français" : course.langue === "mg" ? "Malgache" : "Anglais"}</p>
        </div>
        <div className="course-detail-cta">
          <img src={photoUrl(course.image_url) || "/placeholder-course.jpg"} alt={course.titre} className="course-detail-img" />
          <div className="course-price-box">
            {course.est_premium ? (
              <div className="price-big">{course.prix?.toLocaleString()} Ar</div>
            ) : (
              <div className="price-free-big">Gratuit</div>
            )}
            {enrolled ? (
              <Link to={`/cours/${id}/apprendre`} className="btn btn-primary btn-full btn-lg">
                <FiPlay /> Continuer le cours
              </Link>
            ) : (
              <button className="btn btn-primary btn-full btn-lg" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? "Inscription..." : course.est_premium ? "S'inscrire (Premium requis)" : "S'inscrire gratuitement"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="course-detail-body">
        <section className="lecons-section">
          <h2>Contenu du cours ({lecons.length} leçons)</h2>
          <div className="lecons-list">
            {lecons.map((l, i) => (
              <div key={l.id} className={`lecon-row ${enrolled || l.est_gratuite ? "accessible" : "locked"}`}>
                <span className="lecon-num">{i + 1}</span>
                <div className="lecon-info">
                  <span className="lecon-titre">{l.titre}</span>
                  {l.duree_minutes ? <span className="lecon-dur"><FiClock size={12} /> {l.duree_minutes} min</span> : null}
                </div>
                <div className="lecon-actions">
                  {l.est_gratuite && !enrolled && <span className="badge-free">Gratuit</span>}
                  {enrolled || l.est_gratuite ? <FiPlay size={16} /> : <FiLock size={16} />}
                  {l.est_telechargeable && (enrolled || l.est_gratuite) && <FiDownload size={16} />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="teacher-section">
          <h2>Votre professeur</h2>
          <Link to={`/professeur/${course.professeur_id}`} className="teacher-card">
            <img src={photoUrl(course.professeur_photo) || `https://ui-avatars.com/api/?name=${course.professeur_prenom}+${course.professeur_nom}&background=7B5EA7&color=fff&size=56`} alt="prof" />
            <div>
              <div className="teacher-name">{course.professeur_prenom} {course.professeur_nom}</div>
              <div className="teacher-sub"><FiStar size={13} /> {parseFloat(String(avgNote)).toFixed(1)}</div>
            </div>
          </Link>
        </section>

        <ReviewList coursId={Number(id)} avis={avis} avgNote={avgNote} isEnrolled={enrolled} />
      </div>
    </div>
  );
}
