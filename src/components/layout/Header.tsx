import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mainLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Ver proyectos', href: '/proyectos' },
  { label: 'Agendar reunión', href: '#' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] sm:min-h-20 py-2 sm:py-2.5 gap-4">
          <Link
            to="/"
            className="flex items-center shrink-0 bg-transparent p-0 shadow-none ring-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 rounded-sm"
          >
            <img
              src="/brand/horizonte-logo.svg"
              alt="Inversiones Horizonte"
              className="block h-14 w-auto sm:h-16 md:h-[4.25rem] object-contain object-left bg-transparent shadow-none ring-0"
              decoding="async"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-500 bg-brand-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/cuenta"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Mi Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/entrar"
                  className="px-5 py-2 rounded-lg text-gray-600 text-sm font-semibold hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/entrar"
                  className="px-5 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 shadow-md hover:shadow-lg transition-all"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[calc(100vh-5.5rem)] overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 space-y-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cuenta"
                    className="block text-center px-5 py-3 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    Mi Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-center px-5 py-3 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/entrar"
                    className="block text-center px-5 py-3 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/entrar"
                    className="block text-center px-5 py-3 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
