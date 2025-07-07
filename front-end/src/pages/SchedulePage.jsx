import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

const SchedulePage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await apiClient.get('/schedule/');
        // Ordena os agendamentos por data
        const sortedAppointments = response.data.sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time));
        setAppointments(sortedAppointments);
      } catch (err) {
        setError('Não foi possível carregar a agenda.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) return <p className="text-center">Carregando agenda...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Agenda de Horários (Público)</h1>
      {appointments.length === 0 ? (
        <p>Nenhum horário agendado no momento.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-4">
            {appointments.map(app => (
              <li key={app.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{app.service.name} com {app.barber.name}</p>
                  <p className="text-sm text-gray-600">{new Date(app.appointment_time).toLocaleString('pt-BR')}</p>
                </div>
                <span className="text-green-600 font-semibold capitalize">{app.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
