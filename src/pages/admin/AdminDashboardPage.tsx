import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, TrendingUp, Receipt, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

interface Stats {
  users: number;
  projects: { total: number; active: number; totalRaised: number };
  investments: { total: number; pending: number; active: number; totalAmount: number };
  payments: { total: number; pending: number; approved: number };
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  href: string;
  color: string;
}) {
  return (
    <Link
      to={href}
      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [users, projects, investments, payments] = await Promise.all([
          api.get<number>('/users/count'),
          api.get<Stats['projects']>('/projects/stats'),
          api.get<Stats['investments']>('/investments/stats'),
          api.get<Stats['payments']>('/payments/stats'),
        ]);
        setStats({ users, projects, investments, payments });
      } catch {
        // API not connected yet — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de administracion</h1>
        <p className="text-gray-500 mt-1">Resumen general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Usuarios totales"
          value={stats?.users ?? 0}
          icon={Users}
          href="/admin/usuarios"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Propiedades"
          value={stats?.projects.total ?? 0}
          sub={`${stats?.projects.active ?? 0} activas`}
          icon={FolderKanban}
          href="/admin/propiedades"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Inversiones"
          value={stats?.investments.total ?? 0}
          sub={`${stats?.investments.pending ?? 0} pendientes`}
          icon={TrendingUp}
          href="/admin/inversiones"
          color="bg-blue-50 text-blue-500"
        />
        <StatCard
          label="Pagos por revisar"
          value={stats?.payments.pending ?? 0}
          sub={`${stats?.payments.approved ?? 0} aprobados`}
          icon={Receipt}
          href="/admin/pagos"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {stats && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recaudacion</h2>
            <p className="text-3xl font-bold text-emerald-600">
              {fmt(Number(stats.projects.totalRaised))}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total recaudado en todos los proyectos</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inversiones activas</h2>
            <p className="text-3xl font-bold text-blue-500">
              {fmt(Number(stats.investments.totalAmount))}
            </p>
            <p className="text-sm text-gray-500 mt-1">Monto total comprometido</p>
          </div>
        </div>
      )}
    </div>
  );
}
