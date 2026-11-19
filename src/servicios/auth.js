import { api } from './api';

export const auth = {
  login: (correo, contrasena) => api.post('/api/auth/login', { correo, contrasena }),
  registro: (nombre, correo, contrasena) => api.post('/api/auth/registro', { nombre, correo, contrasena }),
  me: () => api.get('/api/auth/me'),
};
