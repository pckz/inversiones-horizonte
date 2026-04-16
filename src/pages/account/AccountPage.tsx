import { useState } from 'react';
import { User, Mail, Phone, CreditCard, Shield, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export default function AccountPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await api.patch('/auth/me/profile', { fullName: name, phone: phone || null });
      setSaveMsg('Datos actualizados correctamente');
    } catch {
      setSaveMsg('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPassMsg('');
    if (newPass !== confirmPass) {
      setPassMsg('Las contrasenas no coinciden');
      return;
    }
    if (newPass.length < 6) {
      setPassMsg('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    setSavingPass(true);
    try {
      await api.post('/auth/me/change-password', { currentPassword: curPass, newPassword: newPass });
      setPassMsg('Contrasena actualizada correctamente');
      setCurPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setPassMsg(err.message || 'Error al cambiar la contrasena');
    } finally {
      setSavingPass(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Informacion personal', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
        <p className="text-gray-500 mt-1">Administra tu informacion personal y preferencias</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <span className="w-24 h-24 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-3xl font-bold">
                {initial}
              </span>
            )}
            <button className="absolute inset-0 flex items-center justify-center bg-gray-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Informacion personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <User className="w-4 h-4 text-gray-400" /> Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Mail className="w-4 h-4 text-gray-400" /> Correo electronico
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 text-gray-400" /> Telefono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <CreditCard className="w-4 h-4 text-gray-400" /> RUT
              </label>
              <input
                type="text"
                value={user?.taxId ?? ''}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          {saveMsg && (
            <p className={`mt-4 text-sm ${saveMsg.includes('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{saveMsg}</p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Seguridad</h3>
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena actual</label>
              <input
                type="password"
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contrasena</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar nueva contrasena</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            {passMsg && (
              <p className={`text-sm ${passMsg.includes('Error') || passMsg.includes('coinciden') || passMsg.includes('incorrect') ? 'text-red-500' : 'text-emerald-600'}`}>
                {passMsg}
              </p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={savingPass}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-sm transition-all disabled:opacity-50"
            >
              {savingPass ? 'Actualizando...' : 'Actualizar contrasena'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
