import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('cleannow_token');
      const storedUser = localStorage.getItem('cleannow_user');

      if (storedToken && storedUser && storedUser !== 'undefined') {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Nettoyer les valeurs corrompues
        localStorage.removeItem('cleannow_token');
        localStorage.removeItem('cleannow_user');
      }
    } catch (e) {
      // En cas de JSON corrompu, on repart proprement
      localStorage.removeItem('cleannow_token');
      localStorage.removeItem('cleannow_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    // Support des deux formats de réponse backend : { token, user } ou { access, user }
    const jwt = res.data.token || res.data.access || res.data.access_token;
    const userData = res.data.user || res.data.utilisateur || res.data;

    if (!jwt) throw new Error('Token non reçu du serveur');

    localStorage.setItem('cleannow_token', jwt);
    localStorage.setItem('cleannow_user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('cleannow_token');
    localStorage.removeItem('cleannow_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isBeneficiaire = user?.role === 'beneficiaire';
  const isFournisseur = user?.role === 'fournisseur';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      isAdmin, isBeneficiaire, isFournisseur
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);