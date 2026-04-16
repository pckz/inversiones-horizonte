import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserCheck, UserX, ChevronDown, Eye, Mail, Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone: string | null;
  taxId: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  taxId: string;
  role: 'admin' | 'readonly_admin' | 'investor';
  isActive: boolean;
  isVerified: boolean;
}

const EMPTY_FORM: CreateUserForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  taxId: '',
  role: 'investor',
  isActive: true,
  isVerified: false,
};

export default function AdminUsersPage() {
  const { isReadonlyAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>(EMPTY_FORM);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  async function loadUsers() {
    try {
      setLoading(true);
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const data = await api.get<User[]>(`/users${params}`);
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user: User) {
    if (isReadonlyAdmin) return;
    try {
      setSavingId(user.id);
      await api.patch(`/users/${user.id}/toggle-active`, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
      );
    } catch {
      // handle error
    } finally {
      setSavingId(null);
    }
  }

  async function toggleVerified(user: User) {
    if (isReadonlyAdmin) return;
    try {
      setSavingId(user.id);
      await api.patch(`/users/${user.id}`, { isVerified: !user.isVerified });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isVerified: !u.isVerified } : u)),
      );
    } catch {
      // handle error
    } finally {
      setSavingId(null);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (isReadonlyAdmin) return;
    try {
      setCreating(true);
      const created = await api.post<User>('/users', {
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone || undefined,
        taxId: createForm.taxId || undefined,
        role: createForm.role,
        isActive: createForm.isActive,
        isVerified: createForm.isVerified,
      });
      setUsers((prev) => [created, ...prev]);
      setCreateForm(EMPTY_FORM);
      setShowCreateForm(false);
    } catch {
      // handle error
    } finally {
      setCreating(false);
    }
  }

  async function sendReminder(user: User) {
    if (isReadonlyAdmin || user.isVerified) return;
    try {
      setSavingId(user.id);
      await api.post(`/users/${user.id}/send-verification-reminder`, {});
    } catch {
      // handle error
    } finally {
      setSavingId(null);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">Gestiona los usuarios de la plataforma</p>
        </div>
        {!isReadonlyAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 shadow-lg shadow-[#61a5fa]/25 transition-all"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Cerrar' : 'Nuevo usuario'}
          </button>
        )}
      </div>

      {!isReadonlyAdmin && showCreateForm && (
        <form onSubmit={createUser} className="mb-6 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                required
                value={createForm.fullName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrasena inicial</label>
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefono</label>
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">RUT</label>
              <input
                type="text"
                value={createForm.taxId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, taxId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    role: e.target.value as CreateUserForm['role'],
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
              >
                <option value="investor">Inversor</option>
                <option value="admin">Admin</option>
                <option value="readonly_admin">Visor</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-[#61a5fa] focus:ring-[#61a5fa]"
              />
              Usuario activo
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={createForm.isVerified}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, isVerified: e.target.checked }))}
                className="rounded border-gray-300 text-[#61a5fa] focus:ring-[#61a5fa]"
              />
              Marcar como verificado
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#61a5fa] text-white rounded-xl font-semibold hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#61a5fa]/20 focus:border-[#61a5fa]"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="readonly_admin">Visor</option>
              <option value="investor">Inversor</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-3 border-[#61a5fa] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Verificado</th>
                  <th className="px-6 py-3 hidden md:table-cell">RUT</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Ultimo acceso</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/usuarios/${user.id}`} className="block group">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-[#61a5fa] transition-colors">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : user.role === 'readonly_admin'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : user.role === 'readonly_admin' ? 'Visor' : 'Inversor'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isReadonlyAdmin ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {user.isVerified ? 'Si' : 'No'}
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleVerified(user)}
                          disabled={savingId === user.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            user.isVerified ? 'bg-emerald-500' : 'bg-gray-300'
                          } ${savingId === user.id ? 'opacity-60' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.isVerified ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{user.taxId ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{fmtDate(user.lastLoginAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Link
                          to={`/admin/usuarios/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#61a5fa] hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </Link>
                        {!isReadonlyAdmin && !user.isVerified && (
                          <button
                            onClick={() => sendReminder(user)}
                            disabled={savingId === user.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
                          >
                            <Mail className="w-3.5 h-3.5" /> Recordar
                          </button>
                        )}
                        {!isReadonlyAdmin && (
                          <button
                            onClick={() => toggleActive(user)}
                            disabled={savingId === user.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-3.5 h-3.5" /> Desactivar
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" /> Activar
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
