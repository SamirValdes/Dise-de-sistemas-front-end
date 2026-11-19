import { api, construirQuery } from './api';

export const eventos = {
  /** filtros opcionales: { categoria, texto, desde, hasta } */
  listar: (filtros = {}) => api.get(`/api/eventos${construirQuery(filtros)}`),
  obtener: (id) => api.get(`/api/eventos/${id}`),
  crear: (datos) => api.post('/api/eventos', datos),
  actualizar: (id, datos) => api.put(`/api/eventos/${id}`, datos),
  cambiarEstado: (id, estado) => api.patch(`/api/eventos/${id}/estado`, { estado }),
  eliminar: (id) => api.delete(`/api/eventos/${id}`),
};
