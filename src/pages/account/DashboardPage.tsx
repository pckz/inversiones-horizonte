import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, FolderOpen, Clock, ArrowUpRight, MapPin, Building2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Investment {
  id: string;
  amount: number;
  status: string;
  expectedReturnPct: number | null;
  expectedProfitAmount: number | null;
  requestedAt: string;
  approvedAt: string | null;
  project: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    status: string;
    category: string | null;
    location: string | null;
    estimatedReturnPct: number | null;
    estimatedDurationMonths: number | null;
    startDate: string | null;
    projectedEndDate: string | null;
  };
  payments: { id: string; amount: number; status: string; createdAt: string }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Esperando transferencia', color: 'bg-blue-100 text-blue-700' },
  transfer_pending: { label: 'Esperando transferencia', color: 'bg-blue-100 text-blue-700' },
  transfer_review: { label: 'En revision', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Firmada', color: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completada', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

const CONFIRMED_STATUSES = new Set(['signed', 'active', 'completed']);
const PENDING_STATUSES = new Set(['pending', 'transfer_pending', 'transfer_review']);

function computeProgress(startDate: string | null, projectedEndDate: string | null, status: string): number {
  if (status === 'terminado') return 100;
  if (!startDate || !projectedEndDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(projectedEndDate).getTime();
  if (end <= start) return 0;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100)));
}

export default function DashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const confirmedInvestments = useMemo(
    () => investments.filter((i) => CONFIRMED_STATUSES.has(i.status)),
    [investments],
  );
  const pendingInvestments = useMemo(
    () => investments.filter((i) => PENDING_STATUSES.has(i.status)),
    [investments],
  );
  const visibleInvestments = useMemo(
    () => (confirmedInvestments.length > 0 ? confirmedInvestments : pendingInvestments),
    [confirmedInvestments, pendingInvestments],
  );
  const totalInvested = useMemo(
    () => confirmedInvestments.reduce((s, i) => s + Number(i.amount), 0),
    [confirmedInvestments],
  );
  const totalProfit = useMemo(
    () => confirmedInvestments.reduce((s, i) => s + Number(i.expectedProfitAmount ?? 0), 0),
    [confirmedInvestments],
  );
  const activeCount = useMemo(
    () => confirmedInvestments.filter((i) => i.status !== 'completed').length,
    [confirmedInvestments],
  );

  const recentPayments = useMemo(() => {
    return investments
      .flatMap((inv) => inv.payments.map((p) => ({ ...p, projectTitle: inv.project.title, invAmount: inv.amount })))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [investments]);

  const stats = [
    { label: 'Total confirmado', value: fmt(totalInvested), icon: DollarSign, color: 'bg-brand-50 text-brand-600' },
    { label: 'Ganancia estimada', value: totalProfit > 0 ? `+${fmt(totalProfit)}` : '$0', icon: TrendingUp, color: 'bg-success-50 text-success-600' },
    { label: 'Proyectos activos', value: String(activeCount), icon: FolderOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Inversiones confirmadas', value: String(confirmedInvestments.length), icon: Clock, color: 'bg-amber-50 text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Resumen de tus inversiones y actividad reciente</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {pendingInvestments.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes {pendingInvestments.length} inversion{pendingInvestments.length === 1 ? '' : 'es'} pendiente{pendingInvestments.length === 1 ? '' : 's'} de confirmacion de pago.
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Mis Proyectos</h2>
          <Link
            to="/cuenta/proyectos"
            className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {visibleInvestments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aun no tienes inversiones</p>
            <Link to="/proyectos" className="text-brand-500 hover:text-brand-600 text-sm font-medium mt-2 inline-block">
              Explorar proyectos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleInvestments.slice(0, 3).map((inv) => {
              const p = inv.project;
              const progress = computeProgress(p.startDate, p.projectedEndDate, p.status);
              const st = STATUS_LABELS[inv.status] ?? { label: inv.status, color: 'bg-gray-100 text-gray-600' };
              return (
                <Link
                  key={inv.id}
                  to={`/cuenta/proyectos/${inv.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    {p.coverImageUrl ? (
                      <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-300" /></div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-500 transition-colors">{p.title}</h3>
                    {p.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 mb-3">
                        <MapPin className="w-3.5 h-3.5" />{p.location}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Progreso</span><span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Invertido</p>
                        <p className="text-sm font-semibold text-gray-900">{fmt(Number(inv.amount))}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Rentabilidad est.</p>
                        <p className="text-sm font-semibold text-success-600">
                          {inv.expectedReturnPct ? `${Number(inv.expectedReturnPct)}%` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {recentPayments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Actividad reciente</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.map((pay) => {
              const payStatus = pay.status === 'approved' ? 'Aprobado' : pay.status === 'rejected' ? 'Rechazado' : 'Pendiente';
              return (
                <div key={pay.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pago registrado</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pay.projectTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{fmt(Number(pay.amount))}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{payStatus} · {fmtDate(pay.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
