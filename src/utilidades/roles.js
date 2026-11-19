/*
 * Reglas de rol, en un solo sitio.
 *
 * En el prototipo la condición "es administrador" estaba escrita a mano en tres
 * lugares y bastaba con olvidar `empleado` en uno para dejar fuera a Roberto.
 *
 * Desde la Fase 2, `usuario` puede venir de dos fuentes a la vez mientras dura la
 * integración: la API real (rol "Administrador"/"Cliente", el usuario con sesión
 * iniciada) y el mock local que todavía usa el dashboard para listar cuentas
 * (rol 'admin'/'empleado'/'usuario', hasta que la Fase 5 lo conecte a la API).
 * Por eso la comparación es insensible a mayúsculas y acepta ambos vocabularios.
 */

/** Admin/Administrador y empleado comparten el panel administrativo. */
export function esRolAdmin(usuario) {
  const rol = usuario?.rol?.toLowerCase();
  return rol === 'administrador' || rol === 'admin' || rol === 'empleado';
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
  administrador: 'Administrador',
  admin: 'Administrador',
  empleado: 'Empleado',
  cliente: 'Cliente',
  usuario: 'Usuario',
};

/** Nombre del rol listo para mostrar. */
export function etiquetaRol(usuario) {
  const rol = usuario?.rol?.toLowerCase();
  return ETIQUETAS_ROL[rol] ?? 'Usuario';
}
