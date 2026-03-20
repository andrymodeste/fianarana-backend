import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import type { Cours, Lecon } from "../../types";
import { FiChevronLeft, FiChevronRight, FiDownload, FiCheck, FiList } from "react-icons/fi";

export default function LessonPlayer() {
  const { coursId, leconId } = useParams<{ coursId: string; leconId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [course, setCourse]   = useState<Cours | null>(null);
  const [lecons, setLecons]   = useState<Lecon[]>([]);
  const [current, setCurrent] = useState<Lecon | null>(null);
  const [progress, setProgress] = useState<Record<number, { est_terminee: boolean; derniere_position: number }>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coursId) return;
    Promise.all([
      api.get(`/cours/${coursId}`),
      api.get(`/lecons/cours/${coursId}`),
      api.get(`/progression/cours/${coursId}`).catch(() => ({ data: { progression: [] } }))
    ]).then(([c, l, p]) => {
      setCourse(c.data.cours);
      const ls = l.data?.lecons || [];
      setLecons(ls);
      const prog: Record<number, any> = {};
      (p.data?.progression || []).forEach((pp: any) => { prog[pp.lecon_id] = pp; });
      setProgress(prog);
      const cur = leconId ? ls.find((l: Lecon) => l.id === Number(leconId)) : ls[0];
      setCurrent(cur || ls[0]);
    }).finally(() => setLoading(false));
  }, [coursId, leconId]);

  useEffect(() => {
    if (current && videoRef.current && progress[current.id]?.derniere_position) {
      videoRef.current.currentTime = progress[current.id].derniere_position;
    }
  }, [current]);

  const saveProgress = async (terminee = false) => {
    if (!current) return;
    const pos = videoRef.current?.currentTime || 0;
    await api.post("/progression", { lecon_id: current.id, est_terminee: terminee ? 1 : 0, derniere_position: pos, temps_regarde: pos });
    if (terminee) setProgress({ ...progress, [current.id]: { est_terminee: true, derniere_position: pos } });
  };

  const goLecon = (l: Lecon) => {
    setCurrent(l);
    navigate(`/cours/${coursId}/apprendre/${l.id}`);
  };

  const idx = lecons.findIndex(l => l.id === current?.id);
  const prev = idx > 0 ? lecons[idx - 1] : null;
  const next = idx < lecons.length - 1 ? lecons[idx + 1] : null;

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!current) return <div className="page-container"><p>Leçon introuvable.</p></div>;

  return (
    <div className={`lesson-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="lesson-main">
        <div className="lesson-topbar">
          <Link to={`/cours/${coursId}`} className="btn btn-sm btn-outline"><FiChevronLeft /> {course?.titre}</Link>
          <button className="btn btn-sm btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)}><FiList /></button>
        </div>

        <div className="video-wrap">
          {current.video_url ? (
            <video ref={videoRef} controls src={current.video_url} onEnded={() => saveProgress(true)}
              onPause={() => saveProgress(false)} className="lesson-video" />
          ) : (
            <div className="no-video"><p>Pas de vidéo pour cette leçon.</p></div>
          )}
        </div>

        <div className="lesson-info">
          <h1>{current.titre}</h1>
          {current.description && <p>{current.description}</p>}
          <div className="lesson-actions">
            {current.pdf_url && (
              <a href={current.pdf_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                <FiDownload /> Télécharger le PDF
              </a>
            )}
            {!progress[current.id]?.est_terminee && (
              <button className="btn btn-primary btn-sm" onClick={() => saveProgress(true)}>
                <FiCheck /> Marquer comme terminé
              </button>
            )}
            {progress[current.id]?.est_terminee && (
              <span className="badge-success"><FiCheck /> Terminée</span>
            )}
          </div>
        </div>

        <div className="lesson-nav">
          {prev && <button className="btn btn-outline" onClick={() => goLecon(prev)}><FiChevronLeft /> Précédent</button>}
          {next && <button className="btn btn-primary" onClick={() => { saveProgress(false); goLecon(next); }}>Suivant <FiChevronRight /></button>}
        </div>
      </div>

      <div className="lesson-sidebar">
        <div className="sidebar-header"><h3>Leçons du cours</h3></div>
        {lecons.map((l, i) => (
          <div key={l.id} className={`sidebar-lecon ${l.id === current.id ? "active" : ""} ${progress[l.id]?.est_terminee ? "done" : ""}`}
            onClick={() => goLecon(l)}>
            <span className="lecon-num">{i + 1}</span>
            <span className="lecon-title">{l.titre}</span>
            {progress[l.id]?.est_terminee && <FiCheck size={14} className="done-icon" />}
          </div>
        ))}
      </div>
    </div>
  );
}
