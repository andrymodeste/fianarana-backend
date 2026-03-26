import { Link } from "react-router-dom";
import type { Cours } from "../types";
import { FiStar } from "react-icons/fi";
import { photoUrl } from "../utils/photoUrl";

interface Props {
  course: Cours;
}

export default function CourseCard({ course }: Props) {
  const thumbnail = photoUrl(course.image_url) || `https://picsum.photos/seed/${course.id}/320/180`;

  const professeurNom = `${course.professeur_prenom || ""} ${course.professeur_nom || ""}`.trim();

  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-card-img">
        <img src={thumbnail} alt={course.titre} />
      </div>
      <div className="course-card-body">
        <h3 className="course-card-title">{course.titre}</h3>
        <p className="course-card-instructor">{professeurNom}</p>
        <div className="course-card-rating">
          <span className="rating-value">4.5</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <FiStar key={s} className={s <= 4 ? "star filled" : "star"} />
            ))}
          </div>
          <span className="rating-count">{course.matiere_nom || ""}</span>
        </div>
        <div className="course-card-footer">
          {course.est_premium ? (
            <span className="course-price">{course.prix} Ar</span>
          ) : (
            <span className="course-price">Gratuit</span>
          )}
        </div>
      </div>
    </Link>
  );
}
