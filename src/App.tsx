import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/account/DashboardPage';
import MyProjectsPage from './pages/account/MyProjectsPage';
import ProjectViewPage from './pages/account/ProjectViewPage';
import AccountPage from './pages/account/AccountPage';
import GalleryPage from './pages/account/GalleryPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminProjectFormPage from './pages/admin/AdminProjectFormPage';
import AdminInvestmentsPage from './pages/admin/AdminInvestmentsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminPostEditorPage from './pages/admin/AdminPostEditorPage';
import AdminPostPreviewPage from './pages/admin/AdminPostPreviewPage';
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AgendarPage from './pages/AgendarPage';

function ScrollToAnchor() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isReadonlyAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  if (!isAdmin && !isReadonlyAdmin) return <Navigate to="/cuenta" replace />;
  return <>{children}</>;
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/proyectos" element={<MarketplacePage />} />
          <Route path="/proyectos/:slug" element={<ProjectDetailPage />} />
          <Route path="/agendar" element={<AgendarPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToAnchor />
        <Routes>
          <Route path="/entrar" element={<LoginPage />} />

          <Route
            path="/cuenta"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="proyectos" element={<MyProjectsPage />} />
            <Route path="proyectos/:id" element={<ProjectViewPage />} />
            <Route path="perfil" element={<AccountPage />} />
            <Route path="galeria" element={<GalleryPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="usuarios" element={<AdminUsersPage />} />
            <Route path="usuarios/:id" element={<AdminUserDetailPage />} />
            <Route path="propiedades" element={<AdminProjectsPage />} />
            <Route path="propiedades/nuevo" element={<AdminProjectFormPage />} />
            <Route path="propiedades/:id" element={<AdminProjectFormPage />} />
            <Route path="propiedades/:projectId/posts" element={<AdminPostsPage />} />
            <Route path="propiedades/:projectId/posts/nuevo" element={<AdminPostEditorPage />} />
            <Route path="propiedades/:projectId/posts/:postId" element={<AdminPostEditorPage />} />
            <Route path="propiedades/:projectId/posts/:postId/preview" element={<AdminPostPreviewPage />} />
            <Route path="inversiones" element={<AdminInvestmentsPage />} />
            <Route path="pagos" element={<AdminPaymentsPage />} />
            <Route path="preferencias" element={<AdminSettingsPage />} />
          </Route>

          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
