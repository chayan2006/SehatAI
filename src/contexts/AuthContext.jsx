import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore mock session from sessionStorage to survive page reloads
  useEffect(() => {
    const savedUser = sessionStorage.getItem('sehat_mock_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        setToken(u.id);
      } catch (e) {
        console.error("Failed to parse mock session");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, expectedRole) => {
    // Generate a temporary mock user
    const mockUser = {
      id: 'mock-uid-' + Date.now(),
      email: email,
      role: expectedRole || 'patient',
      full_name: email.split('@')[0],
      phone: '',
      medicalProfileComplete: true,
    };
    
    // Save state
    setUser(mockUser);
    setToken(mockUser.id);
    sessionStorage.setItem('sehat_mock_user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  const loginWithGoogle = async (expectedRole, extraData = {}) => {
    const mockUser = {
      id: 'mock-uid-' + Date.now(),
      email: 'googleuser@mock.com',
      role: expectedRole || 'patient',
      full_name: extraData.full_name || 'Google User',
      ...extraData,
      medicalProfileComplete: true,
    };
    
    setUser(mockUser);
    setToken(mockUser.id);
    sessionStorage.setItem('sehat_mock_user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  const register = async ({ email, password, role, full_name, phone, institution, ...extra }) => {
    const mockUser = {
      id: 'mock-uid-' + Date.now(),
      email: email,
      role: role || 'patient',
      full_name: full_name || email.split('@')[0],
      phone: phone || '',
      institution: institution || '',
      ...extra,
      medicalProfileComplete: true,
    };
    
    setUser(mockUser);
    setToken(mockUser.id);
    sessionStorage.setItem('sehat_mock_user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('sehat_mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
