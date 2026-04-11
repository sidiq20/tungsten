'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from './api';
import type { UserResponse } from './types';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const u = await usersApi.me();
      setUser(u);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('tungsten_token');
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('tungsten_token');
    if (stored) {
      setToken(stored);
      usersApi
        .me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('tungsten_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await authApi.login(username, password);
      localStorage.setItem('tungsten_token', data.access_token);
      setToken(data.access_token);
      const me = await usersApi.me();
      setUser(me);
      router.push('/');
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('tungsten_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const register = useCallback(
    async (data: {
      email: string;
      username: string;
      password: string;
      full_name?: string;
    }) => {
      await authApi.register(data);
      // auto-login after register
      await login(data.username, data.password);
    },
    [login],
  );

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
