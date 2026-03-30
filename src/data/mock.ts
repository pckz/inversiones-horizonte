import type { Announcement, FAQ, Project, Testimonial } from '../types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Condominio Parque Almagro',
    slug: 'condominio-parque-almagro',
    description:
      'Proyecto residencial de 24 departamentos en Santiago Centro, con acceso a transporte público, comercio y áreas verdes. Departamentos de 1 y 2 dormitorios orientados a jóvenes profesionales e inversionistas.',
    short_description: 'Residencial de 24 deptos. en zona céntrica con alta demanda.',
    category: 'Residencial',
    status: 'En ejecución',
    image_url:
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200',
    target_amount: 2_800_000_000,
    raised_amount: 1_820_000_000,
    min_investment: 500_000,
    estimated_return_min: 10,
    estimated_return_max: 14,
    annual_return: 11.5,
    duration_months: 18,
    deadline: '2026-12-31',
    location: 'Santiago Centro, Región Metropolitana',
    created_at: '2026-01-15T12:00:00.000Z',
  },
  {
    id: '2',
    title: 'Oficinas Santiago Business',
    slug: 'oficinas-santiago-business',
    description:
      'Torre de oficinas clase A de 12 pisos en Las Condes. Estacionamientos subterráneos, áreas comunes premium y certificación orientada a eficiencia energética. Dirigida a tecnología y servicios profesionales.',
    short_description: 'Torre corporativa clase A en el distrito financiero.',
    category: 'Comercial',
    status: 'Financiando',
    image_url:
      'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=1200',
    target_amount: 4_500_000_000,
    raised_amount: 3_690_000_000,
    min_investment: 1_000_000,
    estimated_return_min: 12,
    estimated_return_max: 16,
    annual_return: 13.2,
    duration_months: 24,
    deadline: '2026-08-15',
    location: 'Las Condes, Región Metropolitana',
    created_at: '2026-02-02T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Loteo Playa Blanca',
    slug: 'loteo-playa-blanca',
    description:
      'Loteo costero en Valparaíso con 30 parcelas de 500 m², urbanización completa (agua, luz, alcantarillado). Zona de plusvalía por desarrollo turístico regional.',
    short_description: 'Parcelas urbanizadas frente al mar en la V Región.',
    category: 'Terrenos',
    status: 'Activo',
    image_url:
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
    target_amount: 1_200_000_000,
    raised_amount: 540_000_000,
    min_investment: 300_000,
    estimated_return_min: 9,
    estimated_return_max: 13,
    annual_return: 10.1,
    duration_months: 12,
    deadline: '2026-11-01',
    location: 'Valparaíso, Región de Valparaíso',
    created_at: '2025-12-20T14:00:00.000Z',
  },
  {
    id: '4',
    title: 'Edificio Ñuñoa Connect',
    slug: 'edificio-nunoa-connect',
    description:
      'Mixed-use con locales comerciales en primer piso y 40 departamentos. Metro cercano y alta conectividad hacia el centro y hacia La Reina.',
    short_description: 'Mixed-use residencial-comercial junto a eje de transporte.',
    category: 'Residencial',
    status: 'Financiando',
    image_url:
      'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg?auto=compress&cs=tinysrgb&w=1200',
    target_amount: 3_100_000_000,
    raised_amount: 890_000_000,
    min_investment: 750_000,
    estimated_return_min: 11,
    estimated_return_max: 15,
    annual_return: 12.4,
    duration_months: 20,
    deadline: '2027-03-01',
    location: 'Ñuñoa, Región Metropolitana',
    created_at: '2026-02-18T09:00:00.000Z',
  },
  {
    id: '5',
    title: 'Plaza O’Higgins Lofts',
    slug: 'plaza-ohiggins-lofts',
    description:
      'Rehabilitación de edificio patrimonial convertido en lofts. Proyecto finalizado con rentas estables y venta de últimas unidades.',
    short_description: 'Lofts en edificio patrimonio recuperado.',
    category: 'Residencial',
    status: 'Finalizado',
    image_url:
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
    target_amount: 950_000_000,
    raised_amount: 950_000_000,
    min_investment: 400_000,
    estimated_return_min: 8,
    estimated_return_max: 11,
    annual_return: 9.2,
    duration_months: 14,
    deadline: null,
    location: 'Santiago, Región Metropolitana',
    created_at: '2025-06-01T11:00:00.000Z',
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

const featuredStatuses = new Set(['Financiando', 'Activo', 'En ejecución']);

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
