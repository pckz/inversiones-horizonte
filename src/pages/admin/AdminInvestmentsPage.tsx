import { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';

interface Investment {
  id: string;
  amount: number;
  status: string;
  requestedAt: string;
  approvedAt: string | null;
  adminNotes: string | null;
  user: { fullName: string; email: string };
  project: { title: string; slug: string };
  _count: { payments: number };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
  transfer_pending: { label: 'Esperando transferencia', color: 'bg-blue-100 text-blue-700' },
  transfer_review: { label: 'En revision', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Firmada', color: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completada', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

const TRANSITIONS: Record<string, string[]> = {
  pending: ['transfer_pending', 'cancelled'],
  transfer_pending: ['transfer_review', 'cancelled'],
  transfer_review: ['signed', 'transfer_pending', 'cancelled'],
  signed: ['active', 'cancelled'],
  active: ['completed'],
};

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadInvestments();
  }, []);

  async function loadInvestments() {
    try {
      setLoading(true);
      const data = await api.get<Investment[]>('/investments/admin');
      setInvestments(data);
    } catch {
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(inv: Investment, newStatus: string) {
    try {
      await api.patch(`/investments/${inv.id}/status`, { status: newStatus });
      setInvestments((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: newStatus } : i)),
      );
    } catch {
      // handle error
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });

  const filtered = investments.filter((inv) => {
    const matchesSearch =
      inv.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inversiones</h1>
        <p className="text-gray-500 mt-1">Gestiona las inversiones y sus estados</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por inversor o proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-3 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No se encontraron inversiones</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Inversor</th>
                  <th className="px-6 py-3">Proyecto</th>
                  <th className="px-6 py-3">Monto</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 hidden md:table-cell">Fecha</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Pagos</th>
                  <th className="px-6 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => {
                  const status = STATUS_LABELS[inv.status] ?? {
                    label: inv.status,
                    color: 'bg-gray-100 text-gray-600',
                  };
                  const transitions = TRANSITIONS[inv.status] ?? [];
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{inv.user.fullName}</p>
                        <p className="text-xs text-gray-400">{inv.user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{inv.project.title}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {fmt(Number(inv.amount))}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                        {fmtDate(inv.requestedAt)}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
                        {inv._count.payments}
                      </td>
                      <td className="px-6 py-4">
                        {transitions.length > 0 ? (
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                if (e.target.value) changeStatus(inv, e.target.value);
                                e.target.value = '';
                              }}
                              defaultValue=""
                              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
                            >
                              <option value="" disabled>
                                Cambiar...
                              </option>
                              {transitions.map((t) => (
                                <option key={t} value={t}>
                                  {STATUS_LABELS[t]?.label ?? t}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
