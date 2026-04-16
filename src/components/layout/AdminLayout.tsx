import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  TrendingUp,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { label: 'Propiedades', href: '/admin/propiedades', icon: FolderKanban },
  { label: 'Inversiones', href: '/admin/inversiones', icon: TrendingUp },
  { label: 'Pagos', href: '/admin/pagos', icon: Receipt },
  { label: 'Preferencias', href: '/admin/preferencias', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 fixed inset-y-0 left-0 z-40">
        <div className="p-5 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/brand/logo-blanco.svg" alt="Inversiones Horizonte" className="h-9 w-auto object-contain" />
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#61a5fa]/20 text-[#61a5fa] rounded">
              ADMIN
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-[#61a5fa]/10 text-[#61a5fa]'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full mb-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Ir a la plataforma
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#61a5fa]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#61a5fa]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <Link to="/admin" className="flex items-center gap-3">
                <img src="/brand/logo-blanco.svg" alt="Inversiones Horizonte" className="h-9 w-auto object-contain" />
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#61a5fa]/20 text-[#61a5fa] rounded">ADMIN</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
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
                      ? 'bg-[#61a5fa]/10 text-[#61a5fa]'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesion
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <span className="hidden sm:block text-sm text-gray-600">
                Hola, <span className="font-semibold text-gray-900">{user?.name?.split(' ')[0]}</span>
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#61a5fa]" />
              </div>
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
