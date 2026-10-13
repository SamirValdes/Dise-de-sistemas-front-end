/*
 * Formateo de fechas en español.
 *
 * Ojo con las dos familias de fechas, que se formatean distinto a propósito:
 *
 *  - Fechas de calendario ("2026-10-15"): hay que añadirles "T00:00:00" antes de
 *    pasarlas a Date. Sin ese sufijo el navegador las interpreta como UTC y en
 *    husos negativos la fecha se corre un día hacia atrás.
 *  - Marcas de tiempo reales ("2024-01-15T10:00:00Z", las de registro y compra):
 *    ya traen zona, así que NO se les añade nada.
 */

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "Jueves, 15 de octubre de 2026" — para las tarjetas y el detalle del evento. */
export function formatearFechaLarga(fechaCalendario) {
  const texto = new Date(`${fechaCalendario}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return capitalizar(texto);
}

/** "15 de octubre de 2026" — para listados donde el día de la semana sobra. */
export function formatearFechaMedia(fechaCalendario) {
  const texto = new Date(`${fechaCalendario}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return capitalizar(texto);
}

/** "10 oct" — para columnas estrechas como la tabla de compras del dashboard. */
export function formatearFechaCorta(fechaCalendario) {
  return new Date(`${fechaCalendario}T00:00:00`)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    .replace('.', '');
}

/** Para marcas de tiempo con zona horaria (registradoEn, compradaEn). */
export function formatearMarcaTiempo(marcaTiempo) {
  const texto = new Date(marcaTiempo).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return capitalizar(texto);
}

/** Igual que la anterior pero corta, para la tabla del dashboard. */
export function formatearMarcaTiempoCorta(marcaTiempo) {
  return new Date(marcaTiempo)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    .replace('.', '');
}
