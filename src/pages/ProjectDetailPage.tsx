import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, TrendingUp, Calendar, DollarSign,
  ArrowLeft, FileText, Shield, ChevronRight, CheckCircle, X,
  Copy, Mail,
} from 'lucide-react';
import { fetchProjectBySlug } from '../lib/projects';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import ProjectDetailSkeleton from '../components/ui/ProjectDetailSkeleton';
import type { Project } from '../types';

function formatCLP(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

type ModalStep = 'simulate' | 'confirm' | 'success';

function InvestmentSimulator({ project }: { project: Project }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(project.min_investment);
  const [step, setStep] = useState<ModalStep>('simulate');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [transferInstructions, setTransferInstructions] = useState('');
  const [copied, setCopied] = useState(false);

  const estimatedProfit = amount * (project.estimated_return / 100);
  const totalReturn = amount + estimatedProfit;
  const returnPct = project.estimated_return;

  const canInvest = project.status === 'En financiamiento' || project.status === 'Financiando';

  const handleInvestClick = () => {
    if (!isAuthenticated) {
      navigate(`/entrar?returnUrl=${encodeURIComponent(`/proyectos/${project.slug}`)}`);
      return;
    }
    if (user?.role === 'admin' || user?.role === 'readonly_admin') {
      setError('Los administradores no pueden invertir');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/investments', {
        projectId: project.id,
        amount,
        expectedReturnPct: returnPct,
        expectedProfitAmount: Math.round(estimatedProfit),
        expectedTotalAmount: Math.round(totalReturn),
      });
      try {
        const settings = await api.get<{ contact_email: string; transfer_instructions: string }>('/settings/public');
        setContactEmail(settings.contact_email);
        setTransferInstructions(settings.transfer_instructions);
      } catch { /* fallback: empty */ }
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la inversion');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInstructions = () => {
    navigator.clipboard.writeText(transferInstructions).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setStep('simulate');
    setError('');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-24">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Simula tu inversion</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Mueve el control para ver cuanto podrias ganar segun el monto que inviertas. Recuerda que estos numeros son estimaciones.</p>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-500 mb-2 block">¿Cuanto te gustaria invertir?</label>
            <input
              type="range"
              min={project.min_investment}
              max={Math.max(project.min_investment * 20, 5000000)}
              step={50000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{formatCLP(project.min_investment)}</span>
              <span className="text-lg font-bold text-gray-900">{formatCLP(amount)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Rentabilidad estimada</span>
              <span className="font-semibold text-gray-900">
                {project.estimated_return}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Duracion aproximada</span>
              <span className="font-semibold text-gray-900">{project.duration_months} meses</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Lo que podrias ganar</span>
              <span className="font-semibold text-success-600">{formatCLP(estimatedProfit)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-gray-700 font-medium">Total que recibirias (inversion + ganancia)</span>
              <span className="text-lg font-bold text-gray-900">{formatCLP(totalReturn)}</span>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}

          {canInvest ? (
            <button
              onClick={handleInvestClick}
              className="w-full py-3.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              {isAuthenticated ? 'Quiero invertir en este proyecto' : 'Registrate para invertir'}
            </button>
          ) : (
            <div className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-xl font-semibold text-center">
              Este proyecto no esta recibiendo inversiones
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Importante: estos calculos son estimaciones basadas en el analisis del proyecto. Los resultados reales pueden ser diferentes. Invertir siempre conlleva riesgos.
          </p>
        </div>
      </div>

      {(step === 'confirm' || step === 'success') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fade-in-up">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'confirm' && (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar inversion</h3>
                <p className="text-sm text-gray-500 mb-6">Revisa los detalles antes de confirmar tu solicitud de inversion.</p>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Proyecto</p>
                    <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Monto</p>
                      <p className="text-lg font-bold text-gray-900">{formatCLP(amount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ganancia est.</p>
                      <p className="text-lg font-bold text-success-600">+{formatCLP(estimatedProfit)}</p>
                    </div>
                  </div>
                  <div className="bg-brand-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-brand-700">Total estimado que recibirias</p>
                      <p className="text-lg font-bold text-brand-700">{formatCLP(totalReturn)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-6">
                  Al confirmar, enviaremos tu solicitud de inversion. Nuestro equipo te contactara para los proximos pasos. No se realizara ningun cargo automatico.
                </p>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">{error}</div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Confirmar inversion'}
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="py-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Solicitud recibida</h3>
                    <p className="text-sm text-gray-500">
                      Inversion en <strong>{project.title}</strong> por <strong>{formatCLP(amount)}</strong>
                    </p>
                  </div>
                </div>

                {transferInstructions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Realiza la transferencia a:</h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1 relative">
                      {transferInstructions.split('\n').map((line, i) => {
                        const [label, ...rest] = line.split(':');
                        const val = rest.join(':').trim();
                        return val ? (
                          <div key={i} className="flex justify-between text-sm gap-2">
                            <span className="text-gray-500 shrink-0">{label.trim()}</span>
                            <span className="font-medium text-gray-900 text-right">{val}</span>
                          </div>
                        ) : (
                          <p key={i} className="text-sm text-gray-700">{line}</p>
                        );
                      })}
                      <button
                        onClick={copyInstructions}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                        title="Copiar datos"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {copied && (
                        <span className="absolute top-3 right-10 text-xs text-emerald-600 font-medium">Copiado</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#61a5fa]" />
                    Proximos pasos
                  </h4>
                  <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
                    <li>Realiza la transferencia por el monto indicado</li>
                    <li>Envia el comprobante a <strong className="text-gray-900">{contactEmail || 'nuestro email'}</strong></li>
                    <li>Recibiras un correo de confirmacion cuando verifiquemos el pago</li>
                  </ol>
                </div>

                <p className="text-xs text-gray-400 mb-5">
                  Tambien te enviamos un email con estos datos. Si tienes dudas, escribe a {contactEmail || 'nuestro equipo'}.
                </p>

                <div className="space-y-3">
                  <Link
                    to="/cuenta/proyectos"
                    className="block w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all text-center"
                  >
                    Ver mis inversiones
                  </Link>
                  <button
                    onClick={handleClose}
                    className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Seguir explorando
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetchProjectBySlug(slug)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="container-max section-padding py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No encontramos este proyecto</h2>
        <p className="text-gray-500 mb-6">Es posible que el proyecto haya sido retirado o que el enlace no sea correcto.</p>
        <Link to="/proyectos" className="text-brand-500 font-semibold hover:text-brand-600 transition-colors">
          Ver todos los proyectos disponibles
        </Link>
      </div>
    );
  }

  const progress = Math.min(100, (project.raised_amount / project.target_amount) * 100);

  const statusColors: Record<string, string> = {
    Financiando: 'bg-brand-500 text-white',
    'En financiamiento': 'bg-brand-500 text-white',
    Financiado: 'bg-success-200 text-success-800',
    Activo: 'bg-success-200 text-success-800',
    'En ejecución': 'bg-yellow-100 text-yellow-800',
    Finalizado: 'bg-gray-100 text-gray-600',
  };

  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-gray-50 min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
          <Link to="/proyectos" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Proyectos
          </Link>
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="text-gray-600 truncate max-w-[200px] sm:max-w-none">{project.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-56 sm:h-72 lg:h-96 object-cover"
              />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700">
                  {project.category}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {project.duration_months} meses
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Asi va el financiamiento</span>
                  <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span>{formatCLP(project.raised_amount)} recaudados</span>
                  <span>Meta: {formatCLP(project.target_amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">{project.estimated_return}%</p>
                  <p className="text-xs text-gray-400">Rentabilidad estimada</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-success-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">{project.annual_return}%</p>
                  <p className="text-xs text-gray-400">Rentabilidad anualizada</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">{project.duration_months} meses</p>
                  <p className="text-xs text-gray-400">Duracion estimada</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <DollarSign className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">{formatCLP(project.min_investment)}</p>
                  <p className="text-xs text-gray-400">Inversion minima</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">De que se trata este proyecto</h2>
              <p className="text-gray-600 leading-relaxed">{project.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-2">Documentos para que revises</h2>
              <p className="text-sm text-gray-500 mb-4">Toda la informacion legal y financiera del proyecto esta disponible aca. Te recomendamos revisarla antes de invertir.</p>
              <div className="space-y-3">
                {['Términos de inversión', 'Análisis financiero', 'Informe legal', 'Tasación comercial'].map((doc) => (
                  <button
                    key={doc}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all text-left"
                  >
                    <FileText className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{doc}</span>
                    <Shield className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <InvestmentSimulator project={project} />
          </div>
        </div>
      </div>
    </section>
  );
}
