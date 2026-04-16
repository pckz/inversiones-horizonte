import { useEffect, useState } from 'react';
import { Search, ChevronDown, Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

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

interface SelectOption {
  id: string;
  fullName?: string;
  email?: string;
  title?: string;
}

interface CreateInvestmentForm {
  userId: string;
  projectId: string;
  amount: string;
  expectedReturnPct: string;
  expectedProfitAmount: string;
  expectedTotalAmount: string;
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

const EMPTY_FORM: CreateInvestmentForm = {
  userId: '',
  projectId: '',
  amount: '',
  expectedReturnPct: '',
  expectedProfitAmount: '',
  expectedTotalAmount: '',
};

export default function AdminInvestmentsPage() {
  const { isReadonlyAdmin } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [projects, setProjects] = useState<SelectOption[]>([]);
  const [createForm, setCreateForm] = useState<CreateInvestmentForm>(EMPTY_FORM);

  useEffect(() => {
    loadInvestments();
    if (!isReadonlyAdmin) {
      loadOptions();
    }
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

  async function loadOptions() {
    try {
      const [userData, projectData] = await Promise.all([
        api.get<SelectOption[]>('/users?role=investor'),
        api.get<SelectOption[]>('/projects/admin'),
      ]);
      setUsers(userData);
      setProjects(projectData);
    } catch {
      setUsers([]);
      setProjects([]);
    }
  }

  async function changeStatus(inv: Investment, newStatus: string) {
    if (isReadonlyAdmin) return;
    try {
      setSavingId(inv.id);
      await api.patch(`/investments/${inv.id}/status`, { status: newStatus });
      setInvestments((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: newStatus } : i)),
      );
    } catch {
      // handle error
    } finally {
      setSavingId(null);
    }
  }

  async function createInvestment(e: React.FormEvent) {
    e.preventDefault();
    if (isReadonlyAdmin) return;
    try {
      setCreating(true);
      await api.post('/investments/admin', {
        userId: createForm.userId,
        projectId: createForm.projectId,
        amount: Number(createForm.amount),
        expectedReturnPct: createForm.expectedReturnPct
          ? Number(createForm.expectedReturnPct)
          : undefined,
        expectedProfitAmount: createForm.expectedProfitAmount
          ? Number(createForm.expectedProfitAmount)
          : undefined,
        expectedTotalAmount: createForm.expectedTotalAmount
          ? Number(createForm.expectedTotalAmount)
          : undefined,
      });
      setCreateForm(EMPTY_FORM);
      setShowCreateForm(false);
      await loadInvestments();
    } catch {
      // handle error
    } finally {
      setCreating(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inversiones</h1>
          <p className="text-gray-500 mt-1">Gestiona las inversiones y sus estados</p>
        </div>
        {!isReadonlyAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cerrar' : 'Registrar inversion'}
          </button>
        )}
      </div>

      {!isReadonlyAdmin && showCreateForm && (
        <form onSubmit={createInvestment} className="mb-6 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
              <select
                required
                value={createForm.userId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, userId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              >
                <option value="">Selecciona un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} {user.email ? `(${user.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Proyecto</label>
              <select
                required
                value={createForm.projectId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, projectId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto</label>
              <input
                type="number"
                min={1}
                required
                value={createForm.amount}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Retorno estimado (%)</label>
              <input
                type="number"
                step="0.01"
                value={createForm.expectedReturnPct}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, expectedReturnPct: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ganancia estimada</label>
              <input
                type="number"
                step="0.01"
                value={createForm.expectedProfitAmount}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, expectedProfitAmount: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total estimado</label>
              <input
                type="number"
                step="0.01"
                value={createForm.expectedTotalAmount}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, expectedTotalAmount: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Registrando...' : 'Registrar inversion'}
            </button>
          </div>
        </form>
      )}

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
                        {!isReadonlyAdmin && transitions.length > 0 ? (
                          <div className="relative">
                            <select
                              disabled={savingId === inv.id}
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
                          <span className="text-xs text-gray-400">{isReadonlyAdmin ? 'Solo lectura' : '—'}</span>
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
