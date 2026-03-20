import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./index.css";

// Pages statiques
import Home       from "./pages/Home";

// Auth
import Login          from "./modules/auth/Login";
import Register       from "./modules/auth/Register";
import ForgotPassword from "./modules/auth/ForgotPassword";

// Profil
import Profile        from "./modules/profile/Profile";
import EditProfile    from "./modules/profile/EditProfile";
import ChangePassword from "./modules/profile/ChangePassword";

// Cours
import CourseList   from "./modules/courses/CourseList";
import CourseDetail from "./modules/courses/CourseDetail";

// Enrollment
import MyCourses from "./modules/enrollment/MyCourses";

// Leçons
import LessonPlayer from "./modules/lessons/LessonPlayer";

// Quiz
import QuizPlayer  from "./modules/quiz/QuizPlayer";
import QuizHistory from "./modules/quiz/QuizHistory";

// Abonnement
import Plans from "./modules/subscription/Plans";

// Messages
import MessagingPage from "./modules/messaging/MessagingPage";

// Récompenses
import BadgesPage from "./modules/rewards/BadgesPage";

// Dashboard
import StudentDashboard from "./modules/dashboard/StudentDashboard";

// Teacher
import TeacherDashboard from "./modules/teacher/TeacherDashboard";
import TeacherProfile   from "./modules/teacher/TeacherProfile";
import CreateCourse     from "./modules/teacher/courses/CreateCourse";
import LessonManager    from "./modules/teacher/lessons/LessonManager";
import QuizManager      from "./modules/teacher/quiz/QuizManager";

// Admin
import AdminDashboard      from "./modules/admin/AdminDashboard";
import UserManagement      from "./modules/admin/users/UserManagement";
import CourseValidation    from "./modules/admin/validation/CourseValidation";
import TeacherValidation   from "./modules/admin/validation/TeacherValidation";
import CatalogManagement   from "./modules/admin/catalog/CatalogManagement";
import AvisModeration      from "./modules/admin/moderation/AvisModeration";
import AdminNotifications  from "./modules/admin/notifications/AdminNotifications";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                    element={<Layout><Home /></Layout>} />
      <Route path="/cours"               element={<Layout><CourseList /></Layout>} />
      <Route path="/cours/:id"           element={<Layout><CourseDetail /></Layout>} />
      <Route path="/abonnement"          element={<Layout><Plans /></Layout>} />

      {/* Auth */}
      <Route path="/connexion"           element={<Login />} />
      <Route path="/inscription"         element={<Register />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />

      {/* Elève - protégées */}
      <Route path="/dashboard"     element={<RequireAuth><Layout><StudentDashboard /></Layout></RequireAuth>} />
      <Route path="/mes-cours"     element={<RequireAuth><Layout><MyCourses /></Layout></RequireAuth>} />
      <Route path="/profil"        element={<RequireAuth><Layout><Profile /></Layout></RequireAuth>} />
      <Route path="/profil/modifier" element={<RequireAuth><Layout><EditProfile /></Layout></RequireAuth>} />
      <Route path="/profil/mot-de-passe" element={<RequireAuth><Layout><ChangePassword /></Layout></RequireAuth>} />
      <Route path="/messages"      element={<RequireAuth><Layout><MessagingPage /></Layout></RequireAuth>} />
      <Route path="/badges"        element={<RequireAuth><Layout><BadgesPage /></Layout></RequireAuth>} />
      <Route path="/quiz/historique" element={<RequireAuth><Layout><QuizHistory /></Layout></RequireAuth>} />

      {/* Lecteur de cours (sans footer/navbar classiques) */}
      <Route path="/cours/:coursId/apprendre"           element={<RequireAuth><LessonPlayer /></RequireAuth>} />
      <Route path="/cours/:coursId/apprendre/:leconId"  element={<RequireAuth><LessonPlayer /></RequireAuth>} />
      <Route path="/quiz/:quizId"                       element={<RequireAuth><QuizPlayer /></RequireAuth>} />

      {/* Professeur */}
      <Route path="/professeur"                          element={<RequireAuth role="professeur"><Layout><TeacherDashboard /></Layout></RequireAuth>} />
      <Route path="/professeur/mon-profil"               element={<RequireAuth role="professeur"><Layout><TeacherProfile /></Layout></RequireAuth>} />
      <Route path="/professeur/nouveau-cours"            element={<RequireAuth role="professeur"><Layout><CreateCourse /></Layout></RequireAuth>} />
      <Route path="/professeur/cours/:coursId/lecons"    element={<RequireAuth role="professeur"><Layout><LessonManager /></Layout></RequireAuth>} />
      <Route path="/professeur/cours/:coursId/quiz/:leconId" element={<RequireAuth role="professeur"><Layout><QuizManager /></Layout></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin"                     element={<RequireAuth role="admin"><Layout><AdminDashboard /></Layout></RequireAuth>} />
      <Route path="/admin/utilisateurs"        element={<RequireAuth role="admin"><Layout><UserManagement /></Layout></RequireAuth>} />
      <Route path="/admin/validation-cours"    element={<RequireAuth role="admin"><Layout><CourseValidation /></Layout></RequireAuth>} />
      <Route path="/admin/validation-profs"    element={<RequireAuth role="admin"><Layout><TeacherValidation /></Layout></RequireAuth>} />
      <Route path="/admin/catalogue"           element={<RequireAuth role="admin"><Layout><CatalogManagement /></Layout></RequireAuth>} />
      <Route path="/admin/avis"                element={<RequireAuth role="admin"><Layout><AvisModeration /></Layout></RequireAuth>} />
      <Route path="/admin/notifications"       element={<RequireAuth role="admin"><Layout><AdminNotifications /></Layout></RequireAuth>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
