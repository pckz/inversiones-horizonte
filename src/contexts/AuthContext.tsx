import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  fullName: string;
  name: string;
  email: string;
  phone: string | null;
  taxId: string | null;
  role: 'admin' | 'readonly_admin' | 'investor';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isReadonlyAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapUser(raw: any): User {
  return {
    id: raw.id,
    fullName: raw.fullName ?? raw.full_name ?? '',
    name: raw.fullName ?? raw.full_name ?? '',
    email: raw.email,
    phone: raw.phone ?? null,
    taxId: raw.taxId ?? raw.tax_id ?? null,
    role: raw.role ?? 'investor',
    avatar: raw.avatar,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<any>('/auth/me')
      .then((data) => {
        if (data) setUser(mapUser(data));
      })
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: any }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('auth_token', res.access_token);
    const me = await api.get<any>('/auth/me');
    setUser(mapUser(me));
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: any }>('/auth/register', {
      email,
      password,
      fullName: name,
    });
    localStorage.setItem('auth_token', res.access_token);
    const me = await api.get<any>('/auth/me');
    setUser(mapUser(me));
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isReadonlyAdmin: user?.role === 'readonly_admin',
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
