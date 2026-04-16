import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { api } from '../../lib/api';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  project: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    api.get<any[]>('/investments/my')
      .then((investments) => {
        const seen = new Set<string>();
        const gallery: GalleryItem[] = [];
        for (const inv of investments) {
          const p = inv.project;
          if (p?.coverImageUrl && !seen.has(p.id)) {
            seen.add(p.id);
            gallery.push({
              id: p.id,
              src: p.coverImageUrl,
              title: p.title,
              project: p.title,
            });
          }
        }
        setItems(gallery);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => {
    if (lightboxIndex !== null) setLightboxIndex(lightboxIndex === 0 ? items.length - 1 : lightboxIndex - 1);
  };
  const next = () => {
    if (lightboxIndex !== null) setLightboxIndex(lightboxIndex === items.length - 1 ? 0 : lightboxIndex + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
        <p className="text-gray-500 mt-1">Imagenes de tus proyectos de inversion</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay imagenes disponibles aun</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100"
            >
              <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-sm font-medium text-white">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center">
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={prev} className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[80vh] px-16">
            <img src={items[lightboxIndex].src} alt={items[lightboxIndex].title} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
            <div className="text-center mt-4">
              <p className="text-white font-medium">{items[lightboxIndex].title}</p>
            </div>
          </div>
          <button onClick={next} className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
