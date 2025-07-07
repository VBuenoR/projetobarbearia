import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyAppointmentsPage = () => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // NOTA: A API atual não tem um endpoint /me/appointments.
      // Vamos buscar todos e filtrar pelo usuário logado.
      // Numa aplicação real, o ideal seria ter um endpoint específico no backend.
      const response = await apiClient.get('/schedule/'); // Reutilizando a rota pública
      const userAppointments = response.data.filter(app => app.user.username === user.username);
      const sortedAppointments = userAppointments.sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time));
      setMyAppointments(sortedAppointments);
    } catch (err) {
      setError('Não foi possível carregar seus agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handlePayment = async (appointmentId) => {
    setMessage('');
    try {
      await apiClient.post(`/appointments/${appointmentId}/pay`, {
        payment_method: "credit_card" // Simulação
      });
      setMessage('Pagamento realizado com sucesso!');
      // Atualiza a lista para refletir o novo status
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar pagamento.');
    }
  };

  if (loading) return <p className="text-center">Carregando seus agendamentos...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meus Agendamentos</h1>
        <Link to="/book-appointment" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          + Novo Agendamento
        </Link>
      </div>
      {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
      {myAppointments.length === 0 ? (
        <p>Você ainda não tem agendamentos.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-4">
            {myAppointments.map(app => (
              <li key={app.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{app.service.name} com {app.barber.name}</p>
                  <p className="text-sm text-gray-600">{new Date(app.appointment_time).toLocaleString('pt-BR')}</p>
                   <p className="text-md font-semibold text-green-600">R$ {app.service.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${app.status === 'pago' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    {app.status}
                  </span>
                  {app.status === 'agendado' && (
                    <button onClick={() => handlePayment(app.id)} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                      Pagar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
