import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { api } from '../../lib/api';

interface Project {
  id: string;
  slug: string;
  title: string;
  status: string;
  targetAmount: number;
  raisedAmount: number;
  isPublic: boolean;
  createdAt: string;
  createdBy: { fullName: string } | null;
  _count: { investments: number; posts: number };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  por_financiarse: { label: 'En financiamiento', color: 'bg-blue-100 text-blue-700' },
  financiado: { label: 'Financiado', color: 'bg-sky-100 text-sky-700' },
  en_ejecucion: { label: 'En ejecucion', color: 'bg-amber-100 text-amber-700' },
  terminado: { label: 'Terminado', color: 'bg-emerald-100 text-emerald-700' },
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const data = await api.get<Project[]>('/projects/admin');
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublic(project: Project) {
    try {
      await api.patch(`/projects/${project.id}`, { isPublic: !project.isPublic });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPublic: !p.isPublic } : p)),
      );
    } catch {
      // handle error
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Estas seguro de eliminar esta propiedad?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // handle error
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-500 mt-1">Gestiona los proyectos de inversion</p>
        </div>
        <Link
          to="/admin/propiedades/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva propiedad
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar propiedad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-3 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No se encontraron propiedades</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Propiedad</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 hidden md:table-cell">Meta</th>
                  <th className="px-6 py-3 hidden md:table-cell">Recaudado</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Inversores</th>
                  <th className="px-6 py-3">Visible</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((project) => {
                  const status = STATUS_LABELS[project.status] ?? {
                    label: project.status,
                    color: 'bg-gray-100 text-gray-600',
                  };
                  const pct =
                    Number(project.targetAmount) > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (Number(project.raisedAmount) / Number(project.targetAmount)) * 100,
                          ),
                        )
                      : 0;
                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{project.title}</p>
                        <p className="text-xs text-gray-400">{project.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                        {fmt(Number(project.targetAmount))}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[80px]">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
                        {project._count.investments}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublic(project)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            project.isPublic
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {project.isPublic ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/admin/propiedades/${project.id}/posts`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#61a5fa] hover:bg-blue-50 transition-colors"
                            title="Publicaciones"
                          >
                            <FileText className="w-4 h-4" />
                            {project._count.posts > 0 && (
                              <span className="sr-only">{project._count.posts}</span>
                            )}
                          </Link>
                          <Link
                            to={`/admin/propiedades/${project.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#61a5fa] hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
