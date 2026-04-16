import { useEffect, useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { api } from '../lib/api';

export default function AgendarPage() {
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ calendly_url: string }>('/settings/public')
      .then((data) => setCalendlyUrl(data.calendly_url))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!calendlyUrl || !containerRef.current) return;

    containerRef.current.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'calendly-inline-widget';
    widget.dataset.url = calendlyUrl;
    widget.style.minWidth = '320px';
    widget.style.height = '700px';
    containerRef.current.appendChild(widget);

    const existing = document.querySelector(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]',
    );
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // @ts-expect-error Calendly global injected by widget script
      if (window.Calendly) window.Calendly.initInlineWidgets();
    }
  }, [calendlyUrl]);

  return (
    <section className="py-12 sm:py-16">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 mb-4">
            <Calendar className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Agenda una reunion
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Coordina una reunion con nuestro equipo para resolver tus dudas sobre
            inversiones, conocer los proyectos disponibles o iniciar tu proceso de inversion.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-7 h-7 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : calendlyUrl ? (
          <div
            ref={containerRef}
            className="max-w-4xl mx-auto rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm"
          />
        ) : (
          <div className="max-w-md mx-auto text-center py-16 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>El calendario de agendamiento no esta disponible en este momento.</p>
          </div>
        )}
      </div>
    </section>
  );
}
