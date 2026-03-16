import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, hospitalService } from '@/database';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      try {
        const session = await authService.getSession();
        if (session) {
          setUser(session.user);
          const profile = await authService.getProfile(session.user.id);
          setRole(profile?.role || session.user.user_metadata?.role);
          
          if (profile?.role === 'doctor' || profile?.role === 'admin') {
            const h = await hospitalService.getMyHospital();
            setHospital(h);
          }
        }
      } catch (err) {
        console.error('Context initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = authService.onAuthChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        const profile = await authService.getProfile(session.user.id);
        setRole(profile?.role || session.user.user_metadata?.role);
        
        if (profile?.role === 'doctor' || profile?.role === 'admin') {
          const h = await hospitalService.getMyHospital();
          setHospital(h);
        }
      } else {
        setUser(null);
        setRole(null);
        setHospital(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    role,
    hospital,
    loading,
    setRole,
    setUser,
    setHospital
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
