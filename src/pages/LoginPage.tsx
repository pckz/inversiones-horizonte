import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    if (user) {
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else {
        const dest = user.role === 'admin' || user.role === 'readonly_admin' ? '/admin' : '/cuenta';
        navigate(dest, { replace: true });
      }
    }
  }, [user, navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Inversiones"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/brand/horizonte-icon.png"
              alt="Horizonte"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-white">Inversiones Horizonte</span>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Invierte en proyectos reales,<br />desde cualquier lugar.
            </h2>
            <p className="text-gray-300 text-lg max-w-md">
              Accede a oportunidades de inversion inmobiliaria con montos accesibles y retornos atractivos.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">+2.500</p>
              <p className="text-sm text-gray-400">Inversionistas</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">$15.000M</p>
              <p className="text-sm text-gray-400">Invertidos</p>
            </div>
            <div className="w-px h-10 bg-gray-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">12.4%</p>
              <p className="text-sm text-gray-400">Rentabilidad promedio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 relative">
        <Link
          to="/"
          className="absolute top-6 right-6 flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-brand-500 hover:text-brand-500 hover:shadow-lg transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          <span>Volver al inicio</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/brand/horizonte-icon.png"
                alt="Horizonte"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Inversiones Horizonte</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
          </h1>
          <p className="text-gray-500 mb-8">
            {isRegister
              ? 'Completa tus datos para comenzar a invertir'
              : 'Ingresa tus credenciales para acceder a tu cuenta'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {error}
              </div>
            )}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Perez"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
                <button type="button" className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
                  Olvidaste tu contrasena?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
              {!submitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                {isRegister ? 'Inicia sesion' : 'Registrate'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
