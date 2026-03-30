import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { getAnnouncements } from '../../data/mock';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Paperclip,
} from 'lucide-react';

const projectData: Record<string, any> = {
  '1': {
    title: 'Condominio Parque Almagro',
    category: 'Residencial',
    status: 'En ejecucion',
    location: 'Santiago Centro, Region Metropolitana',
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    invested: '$850.000',
    returnEstimate: '12.5%',
    annualReturn: '10.2%',
    progress: 65,
    duration: '18 meses',
    startDate: '15 Ene 2026',
    estimatedEnd: '15 Jul 2027',
    description: 'Proyecto residencial de 24 departamentos ubicado en una zona estrategica de Santiago Centro, con acceso a transporte publico, comercio y areas verdes. El proyecto contempla departamentos de 1 y 2 dormitorios orientados a jovenes profesionales e inversionistas.',
    fees: [
      { name: 'Fee de publicacion', amount: '$12.750', status: 'Pagado', date: '15 Ene 2026' },
      { name: 'Fee de administracion Q1', amount: '$8.500', status: 'Pagado', date: '15 Abr 2026' },
      { name: 'Fee de administracion Q2', amount: '$8.500', status: 'Pendiente', date: '15 Jul 2026' },
      { name: 'Fee de exito', amount: 'Por calcular', status: 'Pendiente', date: 'Al cierre' },
    ],
    milestones: [
      { label: 'Inversion confirmada', completed: true, date: '15 Ene 2026' },
      { label: 'Inicio de obra', completed: true, date: '01 Mar 2026' },
      { label: 'Obra gruesa completada', completed: false, date: 'Est. Sep 2026' },
      { label: 'Termino y entrega', completed: false, date: 'Est. Jul 2027' },
    ],
  },
  '2': {
    title: 'Oficinas Santiago Business',
    category: 'Comercial',
    status: 'Financiando',
    location: 'Las Condes, Region Metropolitana',
    image: 'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=800',
    invested: '$1.200.000',
    returnEstimate: '14.2%',
    annualReturn: '11.8%',
    progress: 82,
    duration: '24 meses',
    startDate: '02 Feb 2026',
    estimatedEnd: '02 Feb 2028',
    description: 'Torre de oficinas clase A de 12 pisos en el centro financiero de Las Condes. El proyecto incluye estacionamientos subterraneos, areas comunes premium y certificacion LEED. Orientado a empresas de tecnologia y servicios profesionales.',
    fees: [
      { name: 'Fee de publicacion', amount: '$18.000', status: 'Pagado', date: '02 Feb 2026' },
      { name: 'Fee de administracion Q1', amount: '$12.000', status: 'Pendiente', date: '02 May 2026' },
      { name: 'Fee de exito', amount: 'Por calcular', status: 'Pendiente', date: 'Al cierre' },
    ],
    milestones: [
      { label: 'Inversion confirmada', completed: true, date: '02 Feb 2026' },
      { label: 'Financiamiento completo', completed: false, date: 'Est. Mar 2026' },
      { label: 'Inicio de obra', completed: false, date: 'Est. May 2026' },
      { label: 'Termino y entrega', completed: false, date: 'Est. Feb 2028' },
    ],
  },
  '3': {
    title: 'Loteo Playa Blanca',
    category: 'Terrenos',
    status: 'Activo',
    location: 'Valparaiso, Region de Valparaiso',
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    invested: '$400.000',
    returnEstimate: '10.8%',
    annualReturn: '9.5%',
    progress: 45,
    duration: '12 meses',
    startDate: '20 Dic 2025',
    estimatedEnd: '20 Dic 2026',
    description: 'Proyecto de loteo en zona costera de Valparaiso con acceso directo a playa. Incluye 30 parcelas de 500m2 con urbanizacion completa (agua, luz, alcantarillado). Zona de alta plusvalia por desarrollo turistico de la region.',
    fees: [
      { name: 'Fee de publicacion', amount: '$6.000', status: 'Pagado', date: '20 Dic 2025' },
      { name: 'Fee de administracion S1', amount: '$4.000', status: 'Pagado', date: '20 Mar 2026' },
      { name: 'Fee de exito', amount: 'Por calcular', status: 'Pendiente', date: 'Al cierre' },
    ],
    milestones: [
      { label: 'Inversion confirmada', completed: true, date: '20 Dic 2025' },
      { label: 'Permisos aprobados', completed: true, date: '15 Feb 2026' },
      { label: 'Urbanizacion completada', completed: false, date: 'Est. Ago 2026' },
      { label: 'Venta de parcelas', completed: false, date: 'Est. Dic 2026' },
    ],
  },
};

const statusColors: Record<string, string> = {
  'Financiando': 'bg-brand-100 text-brand-700',
  'Activo': 'bg-success-100 text-success-700',
  'En ejecucion': 'bg-amber-100 text-amber-700',
};

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const project = projectData[id || '1'];
  const announcements = useMemo(() => getAnnouncements(), []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Proyecto no encontrado</p>
        <Link to="/cuenta/proyectos" className="text-brand-500 hover:text-brand-600 mt-2 inline-block">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/cuenta/proyectos"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis proyectos
      </Link>

      <div className="relative rounded-2xl overflow-hidden aspect-[21/7]">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
              {project.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
              {project.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h1>
          <div className="flex items-center gap-1 text-sm text-gray-200 mt-1">
            <MapPin className="w-4 h-4" />
            {project.location}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Invertido', value: project.invested, icon: DollarSign },
          { label: 'Rent. estimada', value: project.returnEstimate, icon: TrendingUp },
          { label: 'Rent. anual', value: project.annualReturn, icon: TrendingUp },
          { label: 'Duracion', value: project.duration, icon: Clock },
          { label: 'Inicio', value: project.startDate, icon: Calendar },
          { label: 'Fin estimado', value: project.estimatedEnd, icon: Calendar },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <item.icon className="w-4 h-4 text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Resumen del proyecto</h2>
            <p className="text-gray-600 leading-relaxed">{project.description}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progreso del proyecto</span>
                <span className="font-semibold text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hitos del proyecto</h2>
            <div className="space-y-4">
              {project.milestones.map((milestone: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${milestone.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {milestone.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Noticias y actualizaciones</h2>
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No hay publicaciones disponibles</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                  >
                    {announcement.image_url && (
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                        {announcement.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatDate(announcement.published_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {announcement.content}
                    </p>
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="space-y-1">
                        {announcement.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span className="underline">{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos</h2>
            <div className="space-y-2">
              {['Contrato de inversion', 'Ficha del proyecto', 'Informe de avance'].map((doc) => (
                <button
                  key={doc}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-700">{doc}</span>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
