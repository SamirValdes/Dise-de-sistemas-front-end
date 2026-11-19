import { api } from './api';

/**
 * Implementación real (Fase 9): llama al backend de Compras/Entradas (Persona 3 + B1-B3).
 * Contrato real, distinto del que asumía la guía original:
 * - No hay reservaId: la reserva es el propio asiento (usuario + bloqueadoHasta).
 * - Los asientos se identifican por su Id numérico, no por su código ("A1").
 * - Un asiento ocupado o una reserva vencida devuelven ambos 409; se distinguen por el
 *   mensaje (ver interpretarlo en checkout.jsx).
 */

/** Misma tarjeta de prueba que usaba la simulación, mapeada a simularRechazo. */
export const TARJETA_RECHAZADA = '4000000000000002';

async function reservarAsientos(eventoId, asientoIds) {
  const { bloqueadoHasta } = await api.post('/api/compras/reservar', {
    eventoId: Number(eventoId),
    asientoIds,
  });

  return { expiraEn: new Date(bloqueadoHasta).getTime() };
}

async function comprar(eventoId, asientoIds, { numeroTarjeta } = {}) {
  const simularRechazo = (numeroTarjeta ?? '').replace(/\s/g, '') === TARJETA_RECHAZADA;

  const compra = await api.post('/api/compras', {
    eventoId: Number(eventoId),
    asientoIds,
    simularRechazo,
  });

  return { compra };
}

function misCompras() {
  return api.get('/api/compras/mias');
}

function misEntradas() {
  return api.get('/api/entradas/mias');
}

export const comprasApi = { reservarAsientos, comprar, misCompras, misEntradas };
