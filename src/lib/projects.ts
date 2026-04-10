import { api } from './api';
import type { Project } from '../types';

const STATUS_LABELS: Record<string, string> = {
  por_financiarse: 'En financiamiento',
  financiado: 'Financiado',
  en_ejecucion: 'En ejecución',
  terminado: 'Finalizado',
};

function mapProject(raw: any): Project {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description ?? '',
    short_description: raw.shortDescription ?? '',
    category: raw.category ?? '',
    status: STATUS_LABELS[raw.status] ?? raw.status,
    image_url: raw.coverImageUrl ?? '',
    target_amount: Number(raw.targetAmount),
    raised_amount: Number(raw.raisedAmount),
    min_investment: Number(raw.minInvestmentAmount),
    estimated_return_min: Number(raw.estimatedReturnMinPct ?? raw.estimatedReturnPct ?? 0),
    estimated_return_max: Number(raw.estimatedReturnMaxPct ?? raw.estimatedReturnPct ?? 0),
    annual_return: Number(raw.annualizedReturnPct ?? raw.estimatedReturnPct ?? 0),
    duration_months: raw.estimatedDurationMonths ?? 0,
    deadline: raw.projectedEndDate ?? null,
    location: raw.location ?? '',
    created_at: raw.createdAt ?? raw.publishedAt ?? '',
  };
}

const FEATURED_STATUSES = new Set(['En financiamiento', 'Financiado', 'Finalizado']);

export async function fetchProjects(): Promise<Project[]> {
  const raw = await api.get<any[]>('/projects');
  return raw.map(mapProject);
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const all = await fetchProjects();
  return all
    .filter((p) => FEATURED_STATUSES.has(p.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
}

export async function fetchFilteredProjects(status: string): Promise<Project[]> {
  const all = await fetchProjects();
  const sorted = all.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  if (status === 'Todos' || !status) return sorted;
  return sorted.filter((p) => p.status === status);
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const raw = await api.get<any>(`/projects/by-slug/${slug}`);
    return mapProject(raw);
  } catch {
    return null;
  }
}
