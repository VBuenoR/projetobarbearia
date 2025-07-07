import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const BookAppointmentPage = () => {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // A rota de barbeiros é protegida, mas o token já é enviado pelo interceptor
        const barbersRes = await apiClient.get('/barbers/');
        const servicesRes = await apiClient.get('/services/');
        setBarbers(barbersRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        setError('Não foi possível carregar os dados para agendamento.');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedBarber || !selectedService || !appointmentTime) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    try {
      await apiClient.post('/appointments/', {
        barber_id: parseInt(selectedBarber),
        service_id: parseInt(selectedService),
        appointment_time: appointmentTime,
      });
      setSuccess('Agendamento realizado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/my-appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar agendamento.');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Agendar um Horário</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700">Escolha o Barbeiro</label>
          <select value={selectedBarber} onChange={(e) => setSelectedBarber(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="">Selecione...</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Escolha o Serviço</label>
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="">Selecione...</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Data e Hora</label>
          <input type="datetime-local" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <button type="submit" className="w-full bg-yellow-500 text-gray-900 py-2 rounded font-semibold hover:bg-yellow-400">
          Confirmar Agendamento
        </button>
      </form>
    </div>
  );
};

export default BookAppointmentPage;
