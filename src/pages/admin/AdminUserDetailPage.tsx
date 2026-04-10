import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  transferReference: string | null;
  status: string;
  transferredAt: string | null;
  createdAt: string;
}

interface Investment {
  id: string;
  amount: number;
  status: string;
  expectedReturnPct: number | null;
  expectedProfitAmount: number | null;
  expectedTotalAmount: number | null;
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  adminNotes: string | null;
  project: {
    title: string;
    slug: string;
    coverImageUrl: string | null;
    status: string;
  };
  payments: Payment[];
}

interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone: string | null;
  taxId: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  investments: Investment[];
}

const INVESTMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
  transfer_pending: { label: 'Esperando transferencia', color: 'bg-yellow-100 text-yellow-700' },
  transfer_review: { label: 'En revision', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Firmada', color: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completada', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  readonly_admin: 'Visor',
  investor: 'Inversor',
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedInv, setExpandedInv] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<UserDetail>(`/users/${id}`)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const fmtDateTime = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-3 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Usuario no encontrado</p>
        <Link to="/admin/usuarios" className="text-[#61a5fa] text-sm mt-2 inline-block hover:underline">
          Volver a usuarios
        </Link>
      </div>
    );
  }

  const totalInvested = user.investments
    .filter((i) => !['cancelled'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const activeInvestments = user.investments.filter((i) => i.status === 'active').length;
  const totalExpectedProfit = user.investments
    .filter((i) => !['cancelled'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.expectedProfitAmount ?? 0), 0);

  return (
    <div>
      <Link
        to="/admin/usuarios"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a usuarios
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-14 h-14 rounded-full bg-[#61a5fa] text-white flex items-center justify-center text-xl font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">{user.fullName}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    user.role === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : user.role === 'readonly_admin'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700 truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">{user.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">{user.taxId ?? 'Sin RUT'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Registrado {fmtDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-500">Ultimo acceso: {fmtDateTime(user.lastLoginAt)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {user.isActive ? (
                    <><CheckCircle2 className="w-3 h-3" /> Activo</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Inactivo</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Verificado</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {user.isVerified ? (
                    <><Shield className="w-3 h-3" /> Verificado</>
                  ) : (
                    'No verificado'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          {user.investments.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Resumen de inversiones</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total inversiones</span>
                  <span className="text-sm font-semibold text-gray-900">{user.investments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Inversiones activas</span>
                  <span className="text-sm font-semibold text-emerald-600">{activeInvestments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Monto invertido</span>
                  <span className="text-sm font-semibold text-gray-900">{fmt(totalInvested)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Ganancia estimada</span>
                  <span className="text-sm font-semibold text-[#61a5fa]">{fmt(totalExpectedProfit)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Investments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Inversiones</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {user.investments.length === 0
                  ? 'Este usuario no tiene inversiones'
                  : `${user.investments.length} inversi${user.investments.length === 1 ? 'on' : 'ones'} registrada${user.investments.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {user.investments.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>Sin inversiones registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {user.investments.map((inv) => {
                  const st = INVESTMENT_STATUS[inv.status] ?? { label: inv.status, color: 'bg-gray-100 text-gray-600' };
                  const isExpanded = expandedInv === inv.id;
                  return (
                    <div key={inv.id}>
                      <button
                        onClick={() => setExpandedInv(isExpanded ? null : inv.id)}
                        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors text-left"
                      >
                        {inv.project.coverImageUrl ? (
                          <img
                            src={inv.project.coverImageUrl}
                            alt={inv.project.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <span className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-gray-400" />
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{inv.project.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${st.color}`}>
                              {st.label}
                            </span>
                            <span className="text-xs text-gray-400">{fmtDate(inv.requestedAt)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">{fmt(Number(inv.amount))}</p>
                          {inv.expectedReturnPct && (
                            <p className="text-xs text-gray-400">{Number(inv.expectedReturnPct)}% retorno</p>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-5 bg-gray-50/50">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Monto</p>
                              <p className="text-sm font-semibold text-gray-900">{fmt(Number(inv.amount))}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Ganancia est.</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {inv.expectedProfitAmount ? fmt(Number(inv.expectedProfitAmount)) : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Total est.</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {inv.expectedTotalAmount ? fmt(Number(inv.expectedTotalAmount)) : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Aprobada</p>
                              <p className="text-sm text-gray-700">{fmtDate(inv.approvedAt)}</p>
                            </div>
                          </div>

                          {inv.adminNotes && (
                            <div className="mb-4 p-3 rounded-xl bg-white border border-gray-100">
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Notas admin</p>
                              <p className="text-sm text-gray-700">{inv.adminNotes}</p>
                            </div>
                          )}

                          {inv.payments.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Pagos ({inv.payments.length})
                              </p>
                              <div className="space-y-2">
                                {inv.payments.map((pay) => {
                                  const ps = PAYMENT_STATUS[pay.status] ?? {
                                    label: pay.status,
                                    color: 'bg-gray-100 text-gray-600',
                                  };
                                  return (
                                    <div
                                      key={pay.id}
                                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{fmt(Number(pay.amount))}</p>
                                          <p className="text-xs text-gray-400">
                                            {pay.transferReference ?? pay.paymentMethod} · {fmtDate(pay.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${ps.color}`}
                                      >
                                        {ps.label}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {inv.payments.length === 0 && (
                            <p className="text-xs text-gray-400 italic">Sin pagos registrados para esta inversion</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
