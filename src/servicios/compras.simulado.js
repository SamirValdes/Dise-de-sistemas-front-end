import { obtenerSesion } from './sesion';
import { calcularTotales, generarCodigoEntrada } from '../utilidades/precios';

const CLAVE_RESERVAS = 'luminaria_reservas_v1';
const CLAVE_COMPRAS = 'luminaria_compras_simuladas_v1';

const DURACION_BLOQUEO_MS = 5 * 60 * 1000;

/**
 * Tarjeta de prueba que simula un pago rechazado (misma convención que usan las
 * pasarelas reales): cualquier otro número se aprueba.
 */
export const TARJETA_RECHAZADA = '4000000000000002';
export const TARJETA_APROBADA = '4242424242424242';

/** Error de compras: trae un mensaje claro y un código a modo de status HTTP. */
export class ErrorCompras extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

function leer(clave) {
  try {
    const bruto = localStorage.getItem(clave);
    const datos = bruto ? JSON.parse(bruto) : null;
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin persistencia, la simulación dura lo que dure la pestaña.
  }
}

function usuarioActual() {
  const sesion = obtenerSesion();
  if (!sesion?.usuario) {
    throw new ErrorCompras('Debes iniciar sesión para comprar.', 401);
  }
  return sesion.usuario;
}

/** Reservas aún no vencidas; de paso limpia las que ya expiraron. */
function reservasVigentes() {
  const ahora = Date.now();
  const todas = leer(CLAVE_RESERVAS);
  const vigentes = todas.filter((reserva) => reserva.expiraEn > ahora);

  if (vigentes.length !== todas.length) {
    guardar(CLAVE_RESERVAS, vigentes);
  }

  return vigentes;
}

function asientosOcupadosSimulados(eventoId, excluirReservaId) {
  const comprados = leer(CLAVE_COMPRAS)
    .filter((compra) => compra.eventoId === eventoId)
    .flatMap((compra) => compra.asientos);

  const reservados = reservasVigentes()
    .filter((reserva) => reserva.eventoId === eventoId && reserva.id !== excluirReservaId)
    .flatMap((reserva) => reserva.asientoIds);

  return new Set([...comprados, ...reservados]);
}

/** Bloquea los asientos 5 minutos. Lanza ErrorCompras (status 409) si alguno ya está tomado. */
async function reservarAsientos(eventoId, asientoIds) {
  const usuario = usuarioActual();
  const ocupados = asientosOcupadosSimulados(eventoId);
  const enConflicto = asientoIds.filter((asiento) => ocupados.has(asiento));

  if (enConflicto.length > 0) {
    throw new ErrorCompras(
      `Estos asientos ya no están disponibles: ${enConflicto.join(', ')}. Elige otros, por favor.`,
      409,
    );
  }

  const reserva = {
    id: `r${Date.now()}`,
    eventoId,
    asientoIds,
    usuarioId: usuario.id,
    expiraEn: Date.now() + DURACION_BLOQUEO_MS,
  };

  guardar(CLAVE_RESERVAS, [...reservasVigentes(), reserva]);

  return { reservaId: reserva.id, expiraEn: reserva.expiraEn };
}

/**
 * Cobra y emite la entrada. `precioBase` y `reservaId` son contexto que no está en el
 * contrato mínimo de la guía pero que esta implementación (y la futura real) necesitan:
 * el primero para calcular el total, el segundo para comprobar el bloqueo de 5 minutos.
 * `numeroTarjeta` es la simulación del pago: con TARJETA_RECHAZADA el pago se rechaza y
 * libera los asientos; con cualquier otro número se aprueba.
 */
async function comprar(eventoId, asientoIds, { reservaId, precioBase, numeroTarjeta } = {}) {
  const usuario = usuarioActual();
  const reservas = reservasVigentes();
  const reserva = reservas.find((r) => r.id === reservaId && r.usuarioId === usuario.id);

  if (!reserva) {
    throw new ErrorCompras('Tu bloqueo de 5 minutos venció. Vuelve a elegir tus asientos.', 410);
  }

  if (numeroTarjeta?.replace(/\s/g, '') === TARJETA_RECHAZADA) {
    guardar(
      CLAVE_RESERVAS,
      reservas.filter((r) => r.id !== reservaId),
    );
    throw new ErrorCompras('El pago fue rechazado por el banco emisor. Intenta con otra tarjeta.', 402);
  }

  const { subtotal, cargoServicio, total } = calcularTotales(asientoIds, precioBase);

  const compra = {
    id: `p${Date.now()}`,
    eventoId,
    usuarioId: usuario.id,
    asientos: asientoIds,
    subtotal,
    cargoServicio,
    total,
    fecha: new Date().toISOString(),
    codigoEntrada: generarCodigoEntrada(),
    estado: 'Pagada',
  };

  guardar(CLAVE_COMPRAS, [...leer(CLAVE_COMPRAS), compra]);
  guardar(
    CLAVE_RESERVAS,
    reservas.filter((r) => r.id !== reservaId),
  );

  return { compra };
}

async function misCompras() {
  const usuario = usuarioActual();
  return leer(CLAVE_COMPRAS).filter((compra) => compra.usuarioId === usuario.id);
}

/** En este modelo cada compra es una sola entrada (un código/QR por compra, no por asiento). */
async function misEntradas() {
  return misCompras();
}

export const comprasSimulado = { reservarAsientos, comprar, misCompras, misEntradas };
