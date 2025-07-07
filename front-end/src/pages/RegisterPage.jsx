import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    try {
      await register(username, email, password);
    } catch (err) {
      setError('Falha no registro. O usuário pode já existir.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrar</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Usuário</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Criar Conta
        </button>
      </form>
       <p className="text-center mt-4">
        Já tem uma conta? <Link to="/login" className="text-blue-500 hover:underline">Faça login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
