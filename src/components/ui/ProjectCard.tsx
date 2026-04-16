import { Link } from 'react-router-dom';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import { isProjectInvestable } from '../../lib/projects';
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
  const canInvest = isProjectInvestable(project);
  const cardClasses = canInvest
    ? 'bg-white border-gray-200 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 hover:-translate-y-2'
    : 'bg-gray-50/80 border-gray-200 opacity-85 hover:border-gray-300 hover:-translate-y-1';

  return (
    <Link
      to={`/proyectos/${project.slug}`}
      className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${cardClasses}`}
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <div className={`absolute inset-0 transition-opacity duration-300 z-10 ${
          canInvest
            ? 'bg-gradient-to-t from-dark/40 to-transparent opacity-0 group-hover:opacity-100'
            : 'bg-white/15 opacity-100'
        }`} />
        <img
          src={project.image_url}
          alt={project.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            canInvest ? 'group-hover:scale-110' : 'grayscale-[0.35]'
          }`}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
            {project.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg">
            {project.category}
          </span>
        </div>
        {!canInvest && (
          <div className="absolute inset-x-3 bottom-3 z-20">
            <span className="inline-flex items-center rounded-full bg-gray-900/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              No disponible para invertir
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className={`font-semibold text-lg mb-1 transition-colors ${
          canInvest ? 'text-gray-900 group-hover:text-brand-500' : 'text-gray-700'
        }`}>
          {project.title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {project.location}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>{formatCLP(project.raised_amount)} recaudados</span>
            <span className={`font-semibold ${canInvest ? 'text-brand-600' : 'text-gray-500'}`}>{progress.toFixed(0)}%</span>
          </div>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`absolute h-full rounded-full transition-all duration-700 ease-out ${
                canInvest
                  ? 'bg-gradient-to-r from-brand-500 to-blue-500 group-hover:shadow-lg group-hover:shadow-brand-500/30'
                  : 'bg-gray-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`w-4 h-4 ${canInvest ? 'text-success-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-semibold ${canInvest ? 'text-gray-900' : 'text-gray-700'}`}>
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
