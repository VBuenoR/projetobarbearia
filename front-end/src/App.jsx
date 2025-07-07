import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import SchedulePage from './pages/SchedulePage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />

          {/* Rotas Protegidas */}
          <Route 
            path="/book-appointment" 
            element={<ProtectedRoute><BookAppointmentPage /></ProtectedRoute>} 
          />
          <Route 
            path="/my-appointments" 
            element={<ProtectedRoute><MyAppointmentsPage /></ProtectedRoute>} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;