import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-yellow-400">Barbearia Navalha</Link>
        <div className="flex items-center space-x-4">
          <Link to="/services" className="hover:text-yellow-400">Serviços</Link>
          <Link to="/schedule" className="hover:text-yellow-400">Agenda</Link>
          {user ? (
            <>
              <Link to="/my-appointments" className="hover:text-yellow-400">Meus Agendamentos</Link>
              <span className="text-yellow-400">Olá, {user.username}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">
                Login
              </Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded">
                Registrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
