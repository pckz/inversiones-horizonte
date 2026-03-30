import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getFaqs } from '../../data/mock';
import type { FAQ } from '../../types';

function FAQItem({ faq, isOpen, toggle }: { faq: FAQ; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors bg-white">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-medium text-dark pr-4">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const faqs = useMemo(() => getFaqs(), []);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-background">
      <div className="container-max section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-dark mb-3">
              Seguro tienes preguntas, y es normal
            </h2>
            <p className="text-gray-600 text-lg">
              Invertir tu dinero es una decision importante y queremos que lo hagas con total claridad.
              Aca respondemos las dudas mas comunes. Si no encuentras lo que buscas, escribenos y te respondemos personalmente.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                toggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
