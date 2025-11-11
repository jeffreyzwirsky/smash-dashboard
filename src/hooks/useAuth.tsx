import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
interface AuthContextType { user: User | null; loading: boolean; login: (username: string, password: string) => Promise<void>; logout: () => void; isAuthenticated: boolean; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const storedUser = localStorage.getItem('user'); if (storedUser) setUser(JSON.parse(storedUser)); setLoading(false); }, []);
  const login = async (username: string, password: string) => { const data = await authAPI.login(username, password); setUser(data.user); };
  const logout = () => { setUser(null); authAPI.logout(); };
  return <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; };
