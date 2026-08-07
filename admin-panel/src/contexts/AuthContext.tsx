import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { requestJson } from '../lib/api';
import { AUTH_STORAGE_KEYS } from '../lib/api';

type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
};

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const persistSession = (
    nextUser: UserProfile | null,
    nextAccessToken?: string,
    nextRefreshToken?: string,
  ) => {
    setUser(nextUser);
    setAccessToken(nextAccessToken ?? null);
    setRefreshToken(nextRefreshToken ?? null);

    if (nextAccessToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, nextAccessToken);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
    }

    if (nextRefreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, nextRefreshToken);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
    }

    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.user);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
      const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
      const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);

      if (!storedUser || !accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedUser) as UserProfile;
        setUser(parsed);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        await refreshSession();
      } catch {
        persistSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await requestJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const nextUser = result.user as UserProfile;
    persistSession(nextUser, result.tokens.accessToken, result.tokens.refreshToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
    if (refreshToken) {
      try {
        await requestJson('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore logout errors and clear local storage
      }
    }
    persistSession(null);
  };

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
      persistSession(null);
      return;
    }

    const result = await requestJson('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    const nextUser = storedUser ? (JSON.parse(storedUser) as UserProfile) : null;
    persistSession(nextUser, result.tokens.accessToken, result.tokens.refreshToken);
  };

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      return;
    }

    const intervalId = window.setInterval(
      () => {
        void refreshSession();
      },
      10 * 60 * 1000,
    );

    return () => window.clearInterval(intervalId);
  }, [accessToken, refreshToken]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshSession,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
