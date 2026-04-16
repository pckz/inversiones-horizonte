import { api } from './api';
import type { Project } from '../types';

const STATUS_LABELS: Record<string, string> = {
  por_financiarse: 'En financiamiento',
  financiado: 'Financiado',
  en_ejecucion: 'En ejecución',
  terminado: 'Finalizado',
};

const INVESTABLE_PROJECT_STATUSES = new Set(['En financiamiento', 'Financiando']);
const STATUS_SORT_ORDER: Record<string, number> = {
  'En financiamiento': 0,
  Financiando: 0,
  Financiado: 1,
  'En ejecución': 2,
  Finalizado: 3,
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
    estimated_return: Number(raw.estimatedReturnPct ?? 0),
    annual_return: Number(raw.annualizedReturnPct ?? raw.estimatedReturnPct ?? 0),
    duration_months: raw.estimatedDurationMonths ?? 0,
    deadline: raw.projectedEndDate ?? null,
    location: raw.location ?? '',
    created_at: raw.createdAt ?? raw.publishedAt ?? '',
  };
}

export function isProjectInvestable(project: Pick<Project, 'status'>): boolean {
  return INVESTABLE_PROJECT_STATUSES.has(project.status);
}

function sortProjectsByAvailability(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const statusOrderDiff = (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99);
    if (statusOrderDiff !== 0) return statusOrderDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

const FEATURED_STATUSES = new Set(['En financiamiento', 'Financiado', 'Finalizado']);

export async function fetchProjects(): Promise<Project[]> {
  const raw = await api.get<any[]>('/projects');
  return raw.map(mapProject);
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  const all = await fetchProjects();
  return sortProjectsByAvailability(all.filter((p) => FEATURED_STATUSES.has(p.status))).slice(0, 3);
}

export async function fetchFilteredProjects(status: string): Promise<Project[]> {
  const all = await fetchProjects();
  const sorted = sortProjectsByAvailability(all);
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
