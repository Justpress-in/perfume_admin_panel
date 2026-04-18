import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearTokens, getAccessToken, setTokens } from 'src/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('loading');

  const fetchMe = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAdmin(null);
      setStatus('unauthenticated');
      return null;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      if (data?.success && data.admin) {
        setAdmin(data.admin);
        setStatus('authenticated');
        return data.admin;
      }
      clearTokens();
      setAdmin(null);
      setStatus('unauthenticated');
      return null;
    } catch (err) {
      clearTokens();
      setAdmin(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    if (!data?.success || !data.accessToken) {
      throw new Error(data?.message || 'Login failed');
    }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setAdmin(data.admin || null);
    setStatus('authenticated');
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // ignore — we clear client state regardless
    }
    clearTokens();
    setAdmin(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ admin, status, login, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
