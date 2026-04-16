import { useEffect, useState } from 'react';
import { Settings, Save, Mail, CreditCard, Calendar } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminSettingsPage() {
  const [contactEmail, setContactEmail] = useState('');
  const [transferInstructions, setTransferInstructions] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get<Record<string, string>>('/settings')
      .then((data) => {
        setContactEmail(data.contact_email ?? '');
        setTransferInstructions(data.transfer_instructions ?? '');
        setCalendlyUrl(data.calendly_url ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/settings', {
        contact_email: contactEmail,
        transfer_instructions: transferInstructions,
        calendly_url: calendlyUrl,
      });
      setMsg('Preferencias guardadas correctamente');
    } catch {
      setMsg('Error al guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-3 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#61a5fa]" />
          Preferencias
        </h1>
        <p className="text-gray-500 mt-1">Configura los datos de contacto y transferencia de la plataforma</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#61a5fa]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Email de contacto</h2>
              <p className="text-sm text-gray-500">Se usa como reply-to en todos los emails y como destino para recibir comprobantes</p>
            </div>
          </div>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="correo@empresa.cl"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa] transition-all"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#61a5fa]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Datos de transferencia</h2>
              <p className="text-sm text-gray-500">Se muestran al usuario despues de invertir y en el email de confirmacion. Usa una linea por cada dato.</p>
            </div>
          </div>
          <textarea
            value={transferInstructions}
            onChange={(e) => setTransferInstructions(e.target.value)}
            rows={8}
            placeholder={"Banco: ...\nTipo de cuenta: ...\nN° de cuenta: ...\nRUT: ...\nNombre: ...\nEmail: ..."}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa] transition-all font-mono text-sm resize-y"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#61a5fa]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Calendly</h2>
              <p className="text-sm text-gray-500">Solo la URL de Calendly (no el codigo HTML). Se usa para embeber el widget de agendamiento.</p>
            </div>
          </div>
          <input
            type="url"
            value={calendlyUrl}
            onChange={(e) => setCalendlyUrl(e.target.value)}
            placeholder="https://calendly.com/tu-usuario/reunion"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa] transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">Ejemplo: https://calendly.com/pckz/agenda</p>
        </div>

        {msg && (
          <p className={`text-sm ${msg.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </div>
      </div>
    </div>
  );
}
