// frontend/src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

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
          setUser(data.data);
        } catch (err) {
          localStorage.removeItem('token');
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
      setUser(data.data);
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
      setUser(data.data);
      return { success: true };
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};