import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  User,
  Image,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Avatar({ name, avatar, size = 'md' }: { name?: string; avatar?: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-sm';
  if (avatar) {
    return <img src={avatar} alt={name} className={`${cls} rounded-full object-cover`} />;
  }
  return (
    <span className={`${cls} rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </span>
  );
}

const sidebarLinks = [
  { label: 'Dashboard', href: '/cuenta', icon: LayoutDashboard },
  { label: 'Mis Proyectos', href: '/cuenta/proyectos', icon: FolderOpen },
  { label: 'Mi Cuenta', href: '/cuenta/perfil', icon: User },
  { label: 'Galeria', href: '/cuenta/galeria', icon: Image },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/cuenta') return location.pathname === '/cuenta';
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-40">
        <div className="p-5 border-b border-gray-100">
          <Link to="/">
            <img src="/brand/horizonte-logo.svg" alt="Inversiones Horizonte" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-brand-50 text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {(user?.role === 'admin' || user?.role === 'readonly_admin') && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-[#61a5fa] transition-all w-full mb-1"
            >
              <Shield className="w-5 h-5" />
              Ir a administracion
            </Link>
          )}
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <Avatar name={user?.name} avatar={user?.avatar} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <Link to="/">
                <img src="/brand/horizonte-logo.svg" alt="Inversiones Horizonte" className="h-10 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesion
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                to="/"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-brand-500 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Volver a la plataforma</span>
                <span className="xs:hidden">Volver</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-600">
                Hola, <span className="font-semibold text-gray-900">{user?.name?.split(' ')[0]}</span>
              </span>
              <Avatar name={user?.name} avatar={user?.avatar} size="sm" />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
