/*
 * Única fuente de verdad de la sesión real (token + usuario de la API) en localStorage.
 * api.js la usa para firmar las peticiones y cerrar la sesión en un 401; AuthContext (fase 2)
 * la usa para no duplicar la lectura/escritura de localStorage en dos sitios.
 *
 * Clave distinta a la de la sesión simulada ('luminaria_sesion_v1') para que no se mezclen
 * un usuario local viejo con uno real de la API.
 */
const CLAVE_SESION = 'luminaria_sesion_api_v1';

/** { token, usuario } o null si no hay sesión guardada o está corrupta. */
export function obtenerSesion() {
  try {
    const bruto = localStorage.getItem(CLAVE_SESION);
    if (!bruto) return null;

    const sesion = JSON.parse(bruto);
    return typeof sesion?.token === 'string' ? sesion : null;
  } catch {
    return null;
  }
}

export function guardarSesion(token, usuario) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ token, usuario }));
  } catch {
    // Sin persistencia la sesión dura lo que dure la pestaña.
  }
}

export function limpiarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que limpiar si localStorage no está disponible.
  }
}
