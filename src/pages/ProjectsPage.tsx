import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { fetchFilteredProjects } from '../lib/projects';
import ProjectCard from '../components/ui/ProjectCard';
import type { Project } from '../types';

const filters = ['Todos', 'En financiamiento', 'Financiado', 'Finalizado'];

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  const activeFilter = searchParams.get('status') || 'Todos';

  useEffect(() => {
    fetchFilteredProjects(activeFilter).then(setProjects).catch(() => {});
  }, [activeFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <section className="py-8 sm:py-12 lg:py-20 bg-gray-50 min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Proyectos
          </h1>
          <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
            Explora todos los proyectos disponibles en nuestra plataforma. Desde oportunidades de inversión activas hasta proyectos en construcción y propiedades finalizadas.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, ubicación o categoría…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  if (f === 'Todos') setSearchParams({});
                  else setSearchParams({ status: f });
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
              No encontramos proyectos con esos criterios. Prueba cambiando los filtros o la búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
