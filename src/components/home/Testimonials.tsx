import { useMemo, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { getTestimonials } from '../../data/mock';

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const testimonials = useMemo(() => getTestimonials(), []);
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Degradado asimétrico */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-max section-padding relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-3">
            Personas reales, experiencias reales
          </h2>
          <p className="text-gray-600 text-lg">
            No tienes que creer solo en nuestra palabra. Estos son los comentarios de personas comunes y corrientes
            que decidieron probar, invirtieron y hoy nos cuentan como les fue. Sin filtros ni ediciones.
          </p>
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-brand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-brand-200 mb-4 group-hover:text-brand-400 transition-colors" />
              <Stars count={t.rating} />
              <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6">
                "{t.quote}"
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="font-semibold text-dark text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.project_name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <Quote className="w-8 h-8 text-brand-100 mb-4" />
            <Stars count={testimonials[current].rating} />
            <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-6">
              "{testimonials[current].quote}"
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p className="font-semibold text-gray-900 text-sm">{testimonials[current].name}</p>
              <p className="text-xs text-gray-400">{testimonials[current].project_name}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-brand-500 w-6' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
