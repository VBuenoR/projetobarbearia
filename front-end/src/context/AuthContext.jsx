import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser({ username: decodedUser.sub });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("Token inválido:", error);
        logout();
      }
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/login/', { username, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const decodedUser = jwtDecode(newToken);
      setUser({ username: decodedUser.sub });
      navigate('/my-appointments');
    } catch (error) {
      console.error('Falha no login:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await apiClient.post('/register/', { username, email, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const decodedUser = jwtDecode(newToken);
      setUser({ username: decodedUser.sub });
      navigate('/my-appointments');
    } catch (error) {
      console.error('Falha no registro:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = { user, token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
