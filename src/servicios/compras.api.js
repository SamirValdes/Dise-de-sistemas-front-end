/*
 * Implementación real, pendiente de la Fase 9: una vez que la Persona 3 entregue
 * /api/compras/reservar, /api/compras, /api/compras/mias y /api/entradas/mias (o las
 * rutas que realmente existan, confirmadas en la Fase 8), estos métodos llaman a la API
 * igual que los demás servicios (ver servicios/eventos.js), usando la misma instancia `api`.
 */
function pendiente() {
  throw new Error(
    'compras.api.js todavía no está implementado. Mientras tanto, VITE_COMPRAS_SIMULADAS=true usa compras.simulado.js.',
  );
}

export const comprasApi = {
  reservarAsientos: pendiente,
  comprar: pendiente,
  misCompras: pendiente,
  misEntradas: pendiente,
};
