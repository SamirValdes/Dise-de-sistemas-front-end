/*
 * Reglas de rol, en un solo sitio.
 *
 * En el prototipo la condición "es administrador" estaba escrita a mano en tres
 * lugares y bastaba con olvidar `empleado` en uno para dejar fuera a Roberto.
 */

/** Admin y empleado comparten el panel administrativo. */
export function esRolAdmin(usuario) {
  return usuario?.rol === 'admin' || usuario?.rol === 'empleado';
}

/** A dónde va cada rol justo después de iniciar sesión. */
export function rutaInicioDe(usuario) {
  return esRolAdmin(usuario) ? '/dashboard' : '/panel';
}

/** Nombre a mostrar del usuario: el primero, para que quepa en la navbar. */
export function nombreCorto(usuario) {
  return usuario ? usuario.nombre.split(' ')[0] : '';
}

/** Inicial para el avatar. */
export function inicialDe(usuario) {
  return usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : '?';
}

const ETIQUETAS_ROL = {
  admin: 'Administrador',
  empleado: 'Empleado',
  usuario: 'Usuario',
};

/** Nombre del rol listo para mostrar. */
export function etiquetaRol(usuario) {
  return ETIQUETAS_ROL[usuario?.rol] ?? 'Usuario';
}
