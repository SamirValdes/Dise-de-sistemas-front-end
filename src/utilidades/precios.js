/*
 * Reglas de negocio de precios.
 *
 * En el prototipo de Figma esta misma cuenta estaba copiada en cuatro archivos
 * (App, SeatMap, EventDetailPage y CheckoutPage) y además no coincidían: el detalle
 * mostraba el total sin el cargo por servicio y el checkout lo sumaba, así que el
 * usuario veía dos totales distintos. Aquí vive una sola vez.
 */

/** Las filas A–C son zona VIP. */
export const FILAS_VIP = ['A', 'B', 'C'];

/** La zona VIP cuesta un 50% más. */
export const RECARGO_VIP = 1.5;

/** Cargo por servicio que se suma al confirmar la compra. */
export const CARGO_SERVICIO = 0.05;

/** Tope de asientos por compra. */
export const MAX_ASIENTOS = 8;

export function esAsientoVip(asiento) {
  return FILAS_VIP.includes(asiento.charAt(0));
}

/**
 * Desglose de una selección de asientos para un precio base dado.
 * Devuelve también el total CON el cargo por servicio, que es el que se muestra
 * siempre para que detalle y checkout nunca discrepen.
 */
export function calcularTotales(asientos, precio) {
  const vip = asientos.filter(esAsientoVip);
  const general = asientos.filter((asiento) => !esAsientoVip(asiento));
  const subtotal = vip.length * precio * RECARGO_VIP + general.length * precio;
  const cargoServicio = subtotal * CARGO_SERVICIO;

  return {
    vip,
    general,
    subtotal,
    cargoServicio,
    total: subtotal + cargoServicio,
  };
}

/** Formato de precio único para toda la app: $45.00 */
export function formatearPrecio(valor) {
  return `$${Number(valor).toFixed(2)}`;
}

/** Etiqueta visible del estado de un evento. */
export function etiquetaEstado(estado) {
  return estado === 'activo' ? 'En venta' : 'Próximamente';
}

const ALFABETO_CODIGO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Código de entrada con la forma TL-XXXXXXXX.
 * El prototipo usaba Math.random().toString(36).substr(2, 8), que está obsoleto
 * y podía devolver menos de 8 caracteres.
 */
export function generarCodigoEntrada() {
  let sufijo = '';
  for (let i = 0; i < 8; i += 1) {
    sufijo += ALFABETO_CODIGO.charAt(Math.floor(Math.random() * ALFABETO_CODIGO.length));
  }
  return `TL-${sufijo}`;
}
