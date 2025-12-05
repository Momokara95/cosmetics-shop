// frontend/src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://cosmetics-shop-production.up.railway.app/api';

  // Vérifie si un utilisateur est connecté au chargement
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const { data } = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // 🔥 On s'assure d'avoir user + role
          setUser({
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role      // 🔥 OBLIGATOIRE
          });

        } catch (err) {
          localStorage.removeItem('token');
          localStorage.setItem('role', data.data.role);   
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // Inscription
  const register = async (name, email, password) => {
    try {
      setError(null);

      const { data } = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('role', data.data.role);   

      setUser({
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role    // 🔥 On stocke le rôle
      });

      return { success: true };

    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Connexion
  const login = async (email, password) => {
    try {
      setError(null);

      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('role', data.data.role);   

      // 🔥 On extrait 100% des infos nécessaires
      const userData = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role   // 🔥 TRÈS IMPORTANT
      };

      setUser(userData);

      return { success: true, user: userData };

    } catch (err) {
      const message = err.response?.data?.message || 'Erreur de connexion';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        API_URL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
