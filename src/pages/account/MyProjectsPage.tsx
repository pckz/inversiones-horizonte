import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Clock, Filter, Building2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Investment {
  id: string;
  amount: number;
  status: string;
  expectedReturnPct: number | null;
  requestedAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    status: string;
    category: string | null;
    location: string | null;
    startDate: string | null;
    projectedEndDate: string | null;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Esperando transferencia', color: 'bg-yellow-100 text-yellow-700' },
  transfer_pending: { label: 'Esperando transferencia', color: 'bg-yellow-100 text-yellow-700' },
  transfer_review: { label: 'En revision', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Firmada', color: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completada', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

function computeProgress(startDate: string | null, endDate: string | null, status: string): number {
  if (status === 'terminado') return 100;
  if (!startDate || !endDate) return 0;
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  if (e <= s) return 0;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - s) / (e - s)) * 100)));
}

function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

const filters = [
  { key: '', label: 'Todos' },
  { key: 'active', label: 'Activas' },
  { key: 'signed', label: 'Firmadas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'pending', label: 'Pendientes' },
];

export default function MyProjectsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    api.get<Investment[]>('/investments/my')
      .then(setInvestments)
      .catch(() => setInvestments([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = useMemo(() => {
    if (!activeFilter) return investments;
    if (activeFilter === 'pending') return investments.filter((i) => ['pending', 'transfer_pending', 'transfer_review'].includes(i.status));
    return investments.filter((i) => i.status === activeFilter);
  }, [investments, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
        <p className="text-gray-500 mt-1">Todos los proyectos en los que has invertido</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === f.key
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{investments.length === 0 ? 'Aun no tienes inversiones' : 'Sin resultados para este filtro'}</p>
          {investments.length === 0 && (
            <Link to="/proyectos" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-sm transition-all">
              Explorar proyectos
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inv) => {
            const p = inv.project;
            const st = STATUS_LABELS[inv.status] ?? { label: inv.status, color: 'bg-gray-100 text-gray-600' };
            const progress = computeProgress(p.startDate, p.projectedEndDate, p.status);
            const days = daysRemaining(p.projectedEndDate);
            return (
              <Link
                key={inv.id}
                to={`/cuenta/proyectos/${inv.id}`}
                className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
              >
                <div className="sm:w-56 aspect-video sm:aspect-auto overflow-hidden flex-shrink-0 bg-gray-100">
                  {p.coverImageUrl ? (
                    <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center min-h-[140px]"><Building2 className="w-10 h-10 text-gray-300" /></div>
                  )}
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                      {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-500 transition-colors">{p.title}</h3>
                    {p.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5" />{p.location}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-6 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-500">Invertido</p>
                      <p className="text-sm font-semibold text-gray-900">{fmt(Number(inv.amount))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rentabilidad est.</p>
                      <p className="text-sm font-semibold text-success-600 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {inv.expectedReturnPct ? `${Number(inv.expectedReturnPct)}%` : '—'}
                      </p>
                    </div>
                    {days !== null && (
                      <div>
                        <p className="text-xs text-gray-500">Dias restantes</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />{days}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Fecha inversion</p>
                      <p className="text-sm font-medium text-gray-700">{fmtDate(inv.requestedAt)}</p>
                    </div>
                  </div>
                  {progress > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progreso</span><span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
