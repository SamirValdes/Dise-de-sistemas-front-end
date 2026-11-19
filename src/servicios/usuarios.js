import { api } from './api';

export const usuarios = {
  listar: () => api.get('/api/usuarios'),
};
