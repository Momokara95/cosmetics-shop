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
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const userData = response.data.data;

          // On met à jour user + role
          setUser({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });

          // On sauvegarde le rôle
          localStorage.setItem("role", userData.role);

        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
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

      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      const data = response.data.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
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

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const data = response.data.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
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
    localStorage.removeItem('role');
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
