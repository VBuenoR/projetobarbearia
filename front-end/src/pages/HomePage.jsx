import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="text-center bg-white p-10 rounded-lg shadow-xl">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Bem-vindo à Barbearia Navalha</h1>
      <p className="text-xl text-gray-600 mb-8">O seu estilo, a nossa paixão. Qualidade e tradição em cada corte.</p>
      <div className="space-x-4">
        <Link to="/services" className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300">
          Ver Serviços
        </Link>
        <Link to="/book-appointment" className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition duration-300">
          Agendar Horário
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
