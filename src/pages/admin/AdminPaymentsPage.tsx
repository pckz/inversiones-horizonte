import { useEffect, useState } from 'react';
import { Search, Check, X as XIcon, ExternalLink, ChevronDown, Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import FileUpload from '../../components/ui/FileUpload';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  transferReference: string | null;
  receiptFileUrl: string | null;
  status: string;
  transferredAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  investment: {
    user: { fullName: string; email: string };
    project: { title: string };
  };
  reviewedBy: { fullName: string } | null;
}

interface InvestmentOption {
  id: string;
  amount: number;
  status: string;
  user: { fullName: string; email: string };
  project: { title: string };
}

interface CreatePaymentForm {
  investmentId: string;
  amount: string;
  paymentMethod: string;
  transferReference: string;
  transferredAt: string;
  receiptFileUrl: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Por revisar', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
};

const EMPTY_FORM: CreatePaymentForm = {
  investmentId: '',
  amount: '',
  paymentMethod: 'bank_transfer',
  transferReference: '',
  transferredAt: '',
  receiptFileUrl: '',
};

export default function AdminPaymentsPage() {
  const { isReadonlyAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [investmentOptions, setInvestmentOptions] = useState<InvestmentOption[]>([]);
  const [createForm, setCreateForm] = useState<CreatePaymentForm>(EMPTY_FORM);

  useEffect(() => {
    loadPayments();
    if (!isReadonlyAdmin) {
      loadInvestmentOptions();
    }
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await api.get<Payment[]>('/payments/admin');
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvestmentOptions() {
    try {
      const data = await api.get<InvestmentOption[]>('/investments/admin');
      setInvestmentOptions(
        data.filter((investment) =>
          ['pending', 'transfer_pending', 'transfer_review'].includes(investment.status),
        ),
      );
    } catch {
      setInvestmentOptions([]);
    }
  }

  async function reviewPayment(id: string, status: 'approved' | 'rejected') {
    if (isReadonlyAdmin) return;
    try {
      await api.patch(`/payments/${id}/review`, { status, reviewNotes: reviewNotes || undefined });
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      setReviewingId(null);
      setReviewNotes('');
    } catch {
      // handle error
    }
  }

  async function createPayment(e: React.FormEvent) {
    e.preventDefault();
    if (isReadonlyAdmin) return;
    try {
      setCreating(true);
      await api.post('/payments/admin', {
        investmentId: createForm.investmentId,
        amount: Number(createForm.amount),
        paymentMethod: createForm.paymentMethod || undefined,
        transferReference: createForm.transferReference || undefined,
        transferredAt: createForm.transferredAt || undefined,
        receiptFileUrl: createForm.receiptFileUrl || undefined,
      });
      setCreateForm(EMPTY_FORM);
      setShowCreateForm(false);
      await loadPayments();
    } catch {
      // handle error
    } finally {
      setCreating(false);
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.investment.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.investment.project.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.transferReference ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos / Transferencias</h1>
          <p className="text-gray-500 mt-1">Registra pagos confirmados y revisa el historico de transferencias</p>
        </div>
        {!isReadonlyAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cerrar' : 'Confirmar pago'}
          </button>
        )}
      </div>

      {!isReadonlyAdmin && showCreateForm && (
        <form onSubmit={createPayment} className="mb-6 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inversion</label>
              <select
                required
                value={createForm.investmentId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, investmentId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              >
                <option value="">Selecciona una inversion</option>
                {investmentOptions.map((investment) => (
                  <option key={investment.id} value={investment.id}>
                    {investment.user.fullName} · {investment.project.title} · {fmt(Number(investment.amount))}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto</label>
              <input
                type="number"
                required
                min={1}
                value={createForm.amount}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Metodo de pago</label>
              <input
                type="text"
                value={createForm.paymentMethod}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Referencia</label>
              <input
                type="text"
                value={createForm.transferReference}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, transferReference: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de transferencia</label>
              <input
                type="date"
                value={createForm.transferredAt}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, transferredAt: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <FileUpload
              value={createForm.receiptFileUrl}
              onChange={(url) => setCreateForm((prev) => ({ ...prev, receiptFileUrl: url }))}
              folder="payment-receipts"
              accept="image/*,.pdf"
              label="Comprobante"
              preview={false}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Confirmando...' : 'Confirmar pago'}
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
              placeholder="Buscar por inversor, proyecto o referencia..."
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
              <option value="">Todos</option>
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
            <p>No se encontraron pagos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Inversor</th>
                  <th className="px-6 py-3">Proyecto</th>
                  <th className="px-6 py-3">Monto</th>
                  <th className="px-6 py-3 hidden md:table-cell">Referencia</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((payment) => {
                  const status = STATUS_LABELS[payment.status] ?? {
                    label: payment.status,
                    color: 'bg-gray-100 text-gray-600',
                  };
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.investment.user.fullName}
                        </p>
                        <p className="text-xs text-gray-400">{payment.investment.user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.investment.project.title}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {fmt(Number(payment.amount))}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 font-mono">
                            {payment.transferReference ?? '—'}
                          </span>
                          {payment.receiptFileUrl && (
                            <a
                              href={payment.receiptFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#61a5fa] hover:text-blue-500"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                        {fmtDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {!isReadonlyAdmin && payment.status === 'pending_review' ? (
                          reviewingId === payment.id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <input
                                type="text"
                                placeholder="Nota (opcional)"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20"
                              />
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => reviewPayment(payment.id, 'approved')}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" /> Aprobar
                                </button>
                                <button
                                  onClick={() => reviewPayment(payment.id, 'rejected')}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                                >
                                  <XIcon className="w-3.5 h-3.5" /> Rechazar
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  setReviewingId(null);
                                  setReviewNotes('');
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReviewingId(payment.id)}
                              className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-500 text-xs font-medium hover:bg-blue-50 transition-colors"
                            >
                              Revisar
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">
                            {isReadonlyAdmin
                              ? payment.reviewedBy
                                ? `Por ${payment.reviewedBy.fullName}`
                                : 'Solo lectura'
                              : payment.reviewedBy
                                ? `Por ${payment.reviewedBy.fullName}`
                                : '—'}
                          </span>
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
