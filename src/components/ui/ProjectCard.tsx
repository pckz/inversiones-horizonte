import { Link } from 'react-router-dom';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import type { Project } from '../../types';

const statusColors: Record<string, string> = {
  Financiando: 'bg-brand-500 text-white',
  'En financiamiento': 'bg-brand-500 text-white',
  Financiado: 'bg-success-200 text-success-800',
  Activo: 'bg-success-200 text-success-800',
  'En ejecución': 'bg-yellow-100 text-yellow-800',
  Finalizado: 'bg-gray-100 text-gray-600',
};

function formatCLP(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return days;
}

export default function ProjectCard({ project }: { project: Project }) {
  const progress = Math.min(100, (project.raised_amount / project.target_amount) * 100);
  const remaining = daysLeft(project.deadline);

  return (
    <Link
      to={`/proyectos/${project.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
            {project.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg">
            {project.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-brand-500 transition-colors">
          {project.title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {project.location}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>{formatCLP(project.raised_amount)} recaudados</span>
            <span className="font-semibold text-brand-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full transition-all duration-700 ease-out group-hover:shadow-lg group-hover:shadow-brand-500/30"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-success-500" />
            <span className="text-sm font-semibold text-gray-900">
              {project.estimated_return}%
            </span>
            <span className="text-xs text-gray-400">rentabilidad est.</span>
          </div>

          {remaining !== null && remaining > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {remaining} dias restantes
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
