import axios from 'axios';

// Cria uma instância do axios configurada para a nossa API
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // URL do seu backend FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Adiciona o token JWT a cada requisição autenticada
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
