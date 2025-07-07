import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/services/');
        setServices(response.data);
      } catch (err) {
        setError('Não foi possível carregar os serviços.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <p className="text-center">Carregando serviços...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nossos Serviços</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">{service.name}</h2>
            <p className="text-gray-600 my-2">{service.description}</p>
            <p className="text-lg font-semibold text-green-600">R$ {service.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Duração: {service.duration_minutes} min</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;