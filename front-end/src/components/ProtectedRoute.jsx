import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
