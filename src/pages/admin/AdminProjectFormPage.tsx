import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../../lib/api';

interface ProjectForm {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  status: string;
  location: string;
  targetAmount: string;
  minInvestmentAmount: string;
  estimatedReturnPct: string;
  estimatedReturnMinPct: string;
  estimatedReturnMaxPct: string;
  estimatedDurationMonths: string;
  projectedEndDate: string;
  startDate: string;
  coverImageUrl: string;
  coverVideoUrl: string;
  isPublic: boolean;
}

const EMPTY: ProjectForm = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  status: 'por_financiarse',
  location: '',
  targetAmount: '',
  minInvestmentAmount: '',
  estimatedReturnPct: '',
  estimatedReturnMinPct: '',
  estimatedReturnMaxPct: '',
  estimatedDurationMonths: '',
  projectedEndDate: '',
  startDate: '',
  coverImageUrl: '',
  coverVideoUrl: '',
  isPublic: false,
};

export default function AdminProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProjectForm>(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (!id) return;
    api
      .get<any>(`/projects/${id}`)
      .then((p) => {
        setForm({
          title: p.title ?? '',
          shortDescription: p.shortDescription ?? '',
          description: p.description ?? '',
          category: p.category ?? '',
          status: p.status ?? 'por_financiarse',
          location: p.location ?? '',
          targetAmount: p.targetAmount?.toString() ?? '',
          minInvestmentAmount: p.minInvestmentAmount?.toString() ?? '',
          estimatedReturnPct: p.estimatedReturnPct?.toString() ?? '',
          estimatedReturnMinPct: p.estimatedReturnMinPct?.toString() ?? '',
          estimatedReturnMaxPct: p.estimatedReturnMaxPct?.toString() ?? '',
          estimatedDurationMonths: p.estimatedDurationMonths?.toString() ?? '',
          projectedEndDate: p.projectedEndDate?.split('T')[0] ?? '',
          startDate: p.startDate?.split('T')[0] ?? '',
          coverImageUrl: p.coverImageUrl ?? '',
          coverVideoUrl: p.coverVideoUrl ?? '',
          isPublic: p.isPublic ?? false,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key: keyof ProjectForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: any = {
        title: form.title,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        category: form.category || undefined,
        status: form.status,
        location: form.location || undefined,
        targetAmount: parseFloat(form.targetAmount),
        minInvestmentAmount: parseFloat(form.minInvestmentAmount),
        estimatedReturnPct: form.estimatedReturnPct ? parseFloat(form.estimatedReturnPct) : undefined,
        estimatedReturnMinPct: form.estimatedReturnMinPct ? parseFloat(form.estimatedReturnMinPct) : undefined,
        estimatedReturnMaxPct: form.estimatedReturnMaxPct ? parseFloat(form.estimatedReturnMaxPct) : undefined,
        estimatedDurationMonths: form.estimatedDurationMonths
          ? parseInt(form.estimatedDurationMonths)
          : undefined,
        projectedEndDate: form.projectedEndDate || undefined,
        startDate: form.startDate || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        coverVideoUrl: form.coverVideoUrl || undefined,
        isPublic: form.isPublic,
      };

      if (isEdit) {
        await api.patch(`/projects/${id}`, body);
      } else {
        await api.post('/projects', body);
      }
      navigate('/admin/propiedades');
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/admin/propiedades')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a propiedades
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEdit ? 'Editar propiedad' : 'Nueva propiedad'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Informacion general</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titulo</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripcion corta
            </label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Ej: Flipping, Arriendo, Desarrollo"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              >
                <option value="por_financiarse">En financiamiento</option>
                <option value="financiado">Financiado</option>
                <option value="en_ejecucion">En ejecucion</option>
                <option value="terminado">Terminado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubicacion</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL imagen de portada
              </label>
              <input
                type="url"
                value={form.coverImageUrl}
                onChange={(e) => set('coverImageUrl', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL video de portada
              </label>
              <input
                type="url"
                value={form.coverVideoUrl}
                onChange={(e) => set('coverVideoUrl', e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Financiamiento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Monto objetivo (CLP)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.targetAmount}
                onChange={(e) => set('targetAmount', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Inversion minima (CLP)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.minInvestmentAmount}
                onChange={(e) => set('minInvestmentAmount', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rentabilidad estimada (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.estimatedReturnPct}
                onChange={(e) => set('estimatedReturnPct', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Retorno minimo (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.estimatedReturnMinPct}
                onChange={(e) => set('estimatedReturnMinPct', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Retorno maximo (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.estimatedReturnMaxPct}
                onChange={(e) => set('estimatedReturnMaxPct', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Duracion (meses)
              </label>
              <input
                type="number"
                min={1}
                value={form.estimatedDurationMonths}
                onChange={(e) => set('estimatedDurationMonths', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha estimada de termino
              </label>
              <input
                type="date"
                value={form.projectedEndDate}
                onChange={(e) => set('projectedEndDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => set('isPublic', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#61a5fa] focus:ring-[#61a5fa]"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Publicar propiedad</p>
              <p className="text-xs text-gray-500">
                Los inversores podran ver esta propiedad en la plataforma
              </p>
            </div>
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
}
