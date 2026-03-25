import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
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

/** Layout public (sans sidebar) */
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

/** Layout authentifié avec sidebar à gauche */
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
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
      <Route path="/dashboard"     element={<RequireAuth><AuthLayout><StudentDashboard /></AuthLayout></RequireAuth>} />
      <Route path="/mes-cours"     element={<RequireAuth><AuthLayout><MyCourses /></AuthLayout></RequireAuth>} />
      <Route path="/profil"        element={<RequireAuth><AuthLayout><Profile /></AuthLayout></RequireAuth>} />
      <Route path="/profil/modifier" element={<RequireAuth><AuthLayout><EditProfile /></AuthLayout></RequireAuth>} />
      <Route path="/profil/mot-de-passe" element={<RequireAuth><AuthLayout><ChangePassword /></AuthLayout></RequireAuth>} />
      <Route path="/messages"      element={<RequireAuth><AuthLayout><MessagingPage /></AuthLayout></RequireAuth>} />
      <Route path="/badges"        element={<RequireAuth><AuthLayout><BadgesPage /></AuthLayout></RequireAuth>} />
      <Route path="/quiz/historique" element={<RequireAuth><AuthLayout><QuizHistory /></AuthLayout></RequireAuth>} />

      {/* Lecteur de cours (sans footer/navbar classiques) */}
      <Route path="/cours/:coursId/apprendre"           element={<RequireAuth><LessonPlayer /></RequireAuth>} />
      <Route path="/cours/:coursId/apprendre/:leconId"  element={<RequireAuth><LessonPlayer /></RequireAuth>} />
      <Route path="/quiz/:quizId"                       element={<RequireAuth><QuizPlayer /></RequireAuth>} />

      {/* Professeur */}
      <Route path="/professeur"                          element={<RequireAuth role="professeur"><AuthLayout><TeacherDashboard /></AuthLayout></RequireAuth>} />
      <Route path="/professeur/mon-profil"               element={<RequireAuth role="professeur"><AuthLayout><TeacherProfile /></AuthLayout></RequireAuth>} />
      <Route path="/professeur/nouveau-cours"            element={<RequireAuth role="professeur"><AuthLayout><CreateCourse /></AuthLayout></RequireAuth>} />
      <Route path="/professeur/cours/:coursId/lecons"    element={<RequireAuth role="professeur"><AuthLayout><LessonManager /></AuthLayout></RequireAuth>} />
      <Route path="/professeur/cours/:coursId/quiz/:leconId" element={<RequireAuth role="professeur"><AuthLayout><QuizManager /></AuthLayout></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin"                     element={<RequireAuth role="admin"><AuthLayout><AdminDashboard /></AuthLayout></RequireAuth>} />
      <Route path="/admin/utilisateurs"        element={<RequireAuth role="admin"><AuthLayout><UserManagement /></AuthLayout></RequireAuth>} />
      <Route path="/admin/validation-cours"    element={<RequireAuth role="admin"><AuthLayout><CourseValidation /></AuthLayout></RequireAuth>} />
      <Route path="/admin/validation-profs"    element={<RequireAuth role="admin"><AuthLayout><TeacherValidation /></AuthLayout></RequireAuth>} />
      <Route path="/admin/catalogue"           element={<RequireAuth role="admin"><AuthLayout><CatalogManagement /></AuthLayout></RequireAuth>} />
      <Route path="/admin/avis"                element={<RequireAuth role="admin"><AuthLayout><AvisModeration /></AuthLayout></RequireAuth>} />
      <Route path="/admin/notifications"       element={<RequireAuth role="admin"><AuthLayout><AdminNotifications /></AuthLayout></RequireAuth>} />

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
