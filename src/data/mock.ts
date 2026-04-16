import type { Announcement, FAQ, Project, Testimonial } from '../types';
import flippingSantiagIVImg from '../assets/projects/flipping-santiagiv.png';
import flippingSantiagoIIIImg from '../assets/projects/flipping-santiago-iii.png';
import flippingSantiagoIIImg from '../assets/projects/flipping-santiago-ii.png';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Flipping SantiagIV',
    slug: 'flipping-santiagiv',
    description:
      'Proyecto de flipping inmobiliario enfocado en compra, remodelación y venta de una propiedad en Santiago. Estrategia orientada a maximizar plusvalía en un plazo acotado.',
    short_description: 'Flipping inmobiliario en Santiago con horizonte de 12 meses.',
    category: 'Flipping',
    status: 'En financiamiento',
    image_url: flippingSantiagIVImg,
    target_amount: 131_000_000,
    raised_amount: 52_400_000,
    min_investment: 250_000,
    estimated_return: 15.2,
    annual_return: 15.2,
    duration_months: 12,
    deadline: '2026-09-30',
    location: 'Santiago, Región Metropolitana',
    created_at: '2026-03-10T12:00:00.000Z',
  },
  {
    id: '2',
    title: 'Flipping Santiago III',
    slug: 'flipping-santiago-iii',
    description:
      'Proyecto de flipping inmobiliario con financiamiento completado. En etapa de ejecución del plan de remodelación y comercialización.',
    short_description: 'Flipping con financiamiento completado y ejecución en curso.',
    category: 'Flipping',
    status: 'Financiado',
    image_url: flippingSantiagoIIIImg,
    target_amount: 130_000_000,
    raised_amount: 130_000_000,
    min_investment: 250_000,
    estimated_return: 15.8,
    annual_return: 15.8,
    duration_months: 12,
    deadline: '2026-07-31',
    location: 'Santiago, Región Metropolitana',
    created_at: '2026-02-05T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Flipping Santiago II',
    slug: 'flipping-santiago-ii',
    description:
      'Proyecto de flipping completado. Se ejecutó la remodelación y la venta final con rentabilidad alcanzada según lo proyectado.',
    short_description: 'Proyecto de flipping finalizado con rentabilidad final definida.',
    category: 'Flipping',
    status: 'Finalizado',
    image_url: flippingSantiagoIIImg,
    target_amount: 60_500_000,
    raised_amount: 60_500_000,
    min_investment: 200_000,
    estimated_return: 17.9,
    annual_return: 17.9,
    duration_months: 11,
    deadline: null,
    location: 'Santiago, Región Metropolitana',
    created_at: '2025-11-12T14:00:00.000Z',
  },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Paula Soto',
    rating: 5,
    quote:
      'La plataforma me explicó el proyecto con claridad y pude diversificar con un monto que me cabía en el bolsillo. Hoy llevo dos proyectos y el seguimiento es ordenado.',
    project_name: 'Loteo Playa Blanca',
    created_at: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 't2',
    name: 'Andrés Fuentes',
    rating: 5,
    quote:
      'Invertí en un edificio de oficinas y los informes de avance son puntuales. Me gusta ver fotos y hitos sin tener que perseguir al administrador.',
    project_name: 'Oficinas Santiago Business',
    created_at: '2026-01-20T15:00:00.000Z',
  },
  {
    id: 't3',
    name: 'Carla Méndez',
    rating: 4,
    quote:
      'Al principio dudaba del crowdfunding inmobiliario, pero el proceso fue transparente y el equipo respondió todas mis dudas antes de firmar.',
    project_name: 'Condominio Parque Almagro',
    created_at: '2025-12-10T12:00:00.000Z',
  },
];

export const MOCK_FAQS: FAQ[] = [
  {
    id: 'f1',
    question: '¿Cuál es el monto mínimo para invertir?',
    answer:
      'Depende de cada proyecto y se indica en la ficha. Suele partir desde montos accesibles para que puedas diversificar en más de una oportunidad.',
    sort_order: 1,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'f2',
    question: '¿Qué riesgos tiene invertir en estos proyectos?',
    answer:
      'Como toda inversión inmobiliaria, existen riesgos de mercado, ejecución y liquidez. Te recomendamos leer los documentos del proyecto y solo invertir lo que estés dispuesto a mantener en el plazo del proyecto.',
    sort_order: 2,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'f3',
    question: '¿Cómo recibo retornos o actualizaciones?',
    answer:
      'Recibirás comunicaciones por la plataforma y, según el proyecto, pagos o distribuciones según lo definido en los términos de cada oportunidad.',
    sort_order: 3,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'f4',
    question: '¿Puedo vender mi participación antes del término?',
    answer:
      'La liquidez depende de las condiciones de cada proyecto. En muchos casos el horizonte es de mediano plazo; revisa siempre la ficha y los documentos legales.',
    sort_order: 4,
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Avance de obra: 65% estructura',
    content:
      'Completamos la losa del piso tipo 8. Próximas semanas: instalaciones eléctricas y enfierradura de los últimos niveles. Adjuntamos fotos del sector.',
    image_url:
      'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800',
    attachments: [
      { name: 'Informe avance marzo.pdf', url: '#', type: 'application/pdf' },
    ],
    published_at: '2026-03-15T14:00:00.000Z',
  },
  {
    id: 'a2',
    title: 'Reunión inversores — grabación',
    content:
      'Subimos la grabación de la sesión de preguntas y respuestas con el equipo de desarrollo. Temas: cronograma, permisos y próximos desembolsos.',
    image_url: null,
    attachments: [],
    published_at: '2026-03-01T10:00:00.000Z',
  },
];

const featuredStatuses = new Set(['En financiamiento', 'Financiado', 'Finalizado']);

export function getFeaturedProjects(): Project[] {
  return [...MOCK_PROJECTS]
    .filter((p) => featuredStatuses.has(p.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
}

export function getProjects(filterStatus: string): Project[] {
  const list = [...MOCK_PROJECTS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (filterStatus === 'Todos' || !filterStatus) return list;
  return list.filter((p) => p.status === filterStatus);
}

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  if (!slug) return undefined;
  return MOCK_PROJECTS.find((p) => p.slug === slug);
}

export function getTestimonials(): Testimonial[] {
  return [...MOCK_TESTIMONIALS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getFaqs(): FAQ[] {
  return [...MOCK_FAQS].sort((a, b) => a.sort_order - b.sort_order);
}

export function getAnnouncements(): Announcement[] {
  return [...MOCK_ANNOUNCEMENTS].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}
