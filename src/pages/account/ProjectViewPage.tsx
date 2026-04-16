import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Download,
  Building2,
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transferReference: string | null;
  createdAt: string;
}

interface ProjectDoc {
  id: string;
  title: string;
  fileUrl: string;
  documentType: string;
}

interface BlogPost {
  id: string;
  title: string;
  body: string;
  coverImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  attachments?: { id: string; title: string; fileUrl: string; fileType: string }[];
}

interface InvestmentDetail {
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
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    status: string;
    category: string | null;
    location: string | null;
    description: string | null;
    estimatedReturnPct: number | null;
    estimatedDurationMonths: number | null;
    startDate: string | null;
    projectedEndDate: string | null;
    targetAmount: number;
    raisedAmount: number;
  };
  payments: Payment[];
}

const INV_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Esperando transferencia', color: 'bg-yellow-100 text-yellow-700' },
  transfer_pending: { label: 'Esperando transferencia', color: 'bg-yellow-100 text-yellow-700' },
  transfer_review: { label: 'En revision', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Firmada', color: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completada', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Pendiente', color: 'text-yellow-600' },
  approved: { label: 'Aprobado', color: 'text-emerald-600' },
  rejected: { label: 'Rechazado', color: 'text-red-600' },
};

function computeProgress(startDate: string | null, endDate: string | null, status: string): number {
  if (status === 'terminado') return 100;
  if (!startDate || !endDate) return 0;
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  if (e <= s) return 0;
  return Math.min(100, Math.max(0, Math.round(((Date.now() - s) / (e - s)) * 100)));
}

function annualizedReturn(returnPct: number | null, months: number | null): number | null {
  if (!returnPct || !months || months <= 0) return null;
  return parseFloat(((returnPct / months) * 12).toFixed(2));
}

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const [inv, setInv] = useState<InvestmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<InvestmentDetail>(`/investments/${id}`)
      .then((data) => {
        setInv(data);
        if (data.project?.id) {
          api.get<BlogPost[]>(`/posts/project/${data.project.id}?published=true`).then(setPosts).catch(() => {});
          api.get<any>(`/projects/${data.project.slug}`)
            .then((proj) => {
              if (proj.documents) setDocs(proj.documents.filter((d: any) => d.visibility !== 'internal'));
            })
            .catch(() => {});
        }
      })
      .catch(() => setInv(null))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!inv) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Inversion no encontrada</p>
        <Link to="/cuenta/proyectos" className="text-brand-500 hover:text-brand-600 mt-2 inline-block">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  const p = inv.project;
  const progress = computeProgress(p.startDate, p.projectedEndDate, p.status);
  const annReturn = annualizedReturn(Number(p.estimatedReturnPct), p.estimatedDurationMonths);
  const invSt = INV_STATUS[inv.status] ?? { label: inv.status, color: 'bg-gray-100 text-gray-600' };

  const metricCards = [
    { label: 'Invertido', value: fmt(Number(inv.amount)), icon: DollarSign },
    { label: 'Rent. estimada', value: inv.expectedReturnPct ? `${Number(inv.expectedReturnPct)}%` : '—', icon: TrendingUp },
    { label: 'Rent. anual', value: annReturn ? `${annReturn}%` : '—', icon: TrendingUp },
    { label: 'Duracion', value: p.estimatedDurationMonths ? `${p.estimatedDurationMonths} meses` : '—', icon: Clock },
    { label: 'Inicio', value: fmtDate(p.startDate), icon: Calendar },
    { label: 'Fin estimado', value: fmtDate(p.projectedEndDate), icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <Link to="/cuenta/proyectos" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a mis proyectos
      </Link>

      <div className="relative rounded-2xl overflow-hidden aspect-[21/7] bg-gray-200">
        {p.coverImageUrl ? (
          <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="w-16 h-16 text-gray-400" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invSt.color}`}>{invSt.label}</span>
            {p.category && <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">{p.category}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{p.title}</h1>
          {p.location && (
            <div className="flex items-center gap-1 text-sm text-gray-200 mt-1"><MapPin className="w-4 h-4" />{p.location}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <item.icon className="w-4 h-4 text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Resumen del proyecto</h2>
            <p className="text-gray-600 leading-relaxed">{p.description || 'Sin descripcion disponible.'}</p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progreso del proyecto</span>
                <span className="font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {inv.expectedProfitAmount && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Detalle financiero</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Monto invertido</p>
                  <p className="text-lg font-bold text-gray-900">{fmt(Number(inv.amount))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Ganancia estimada</p>
                  <p className="text-lg font-bold text-success-600">+{fmt(Number(inv.expectedProfitAmount))}</p>
                </div>
                {inv.expectedTotalAmount && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Retorno total est.</p>
                    <p className="text-lg font-bold text-gray-900">{fmt(Number(inv.expectedTotalAmount))}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {inv.payments.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pagos ({inv.payments.length})</h2>
              <div className="space-y-3">
                {inv.payments.map((pay) => {
                  const ps = PAY_STATUS[pay.status] ?? { label: pay.status, color: 'text-gray-600' };
                  return (
                    <div key={pay.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fmt(Number(pay.amount))}</p>
                        <p className="text-xs text-gray-400">{pay.transferReference ?? pay.paymentMethod} · {fmtDate(pay.createdAt)}</p>
                      </div>
                      <span className={`text-xs font-semibold ${ps.color}`}>{ps.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Publicaciones</h2>
            {selectedPost ? (
              <div>
                <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 mb-4">
                  <ArrowLeft className="w-3 h-3" /> Volver
                </button>
                {selectedPost.coverImage && <img src={selectedPost.coverImage} alt={selectedPost.title} className="w-full h-40 object-cover rounded-lg mb-4" />}
                <h3 className="text-base font-bold text-gray-900 mb-1">{selectedPost.title}</h3>
                <p className="text-xs text-gray-400 mb-4">{fmtDate(selectedPost.publishedAt ?? selectedPost.createdAt)}</p>
                <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: selectedPost.body }} />
                {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Adjuntos</p>
                    {selectedPost.attachments.map((att) => (
                      <a key={att.id} href={att.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{att.title}</span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8"><p className="text-sm text-gray-500">No hay publicaciones disponibles</p></div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {posts.map((post) => (
                  <button key={post.id} onClick={() => setSelectedPost(post)} className="w-full text-left border border-gray-100 rounded-xl p-4 hover:border-brand-200 hover:bg-brand-50/30 transition-colors">
                    {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-28 object-cover rounded-lg mb-3" />}
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1">{post.title}</h3>
                    <p className="text-xs text-gray-400">{fmtDate(post.publishedAt ?? post.createdAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos</h2>
            {docs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Sin documentos disponibles</p>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">{doc.title}</span>
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
