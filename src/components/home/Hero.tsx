import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo con gradiente más prominente */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-blue-50/30 to-green-50/20" />

      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-brand-400/20 to-blue-400/10 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-tr from-green-400/15 to-brand-400/10 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-400/10 to-brand-300/5 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <div className="relative container-max px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-dark leading-tight mb-6 animate-fade-in-up">
              Inversión inmobiliaria con{' '}
              <span className="bg-gradient-to-r from-brand-500 to-blue-600 bg-clip-text text-transparent">
                disciplina y transparencia
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 animate-fade-in-up-delay-1">
              Accede a oportunidades inmobiliarias adquiridas bajo valor de mercado, gestionadas de forma activa y con seguimiento del avance del proyecto.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-fade-in-up-delay-2">
              <Link
                to="/proyectos"
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-brand-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Ver proyectos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/como-funciona"
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-dark rounded-lg text-sm sm:text-base font-semibold border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all duration-300"
              >
                Crear cuenta
              </Link>
            </div>
          </div>

          {/* Composición de imágenes superpuestas */}
          <div className="hidden lg:block animate-fade-in-up-delay-3">
            <div className="relative">
              {/* Imagen principal */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/30 to-blue-500/20 rounded-2xl blur-2xl animate-pulse"
                     style={{ animationDuration: '3s' }} />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80">
                  <img
                    src="https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Proyecto inmobiliario principal"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Imagen secundaria superpuesta */}
              <div className="absolute -bottom-6 -right-6 w-56 h-56 animate-fade-in-up-delay-4">
                <div className="absolute -inset-2 bg-gradient-to-br from-green-500/30 to-brand-500/20 rounded-xl blur-xl" />
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl border-4 border-white hover:scale-105 transition-transform duration-500">
                  <img
                    src="https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Detalle de inversión"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Badge flotante */}
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">+18% ROI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
