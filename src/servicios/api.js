import { limpiarSesion, obtenerSesion } from './sesion';

const URL_BASE = import.meta.env.VITE_API_URL;

/** Error de API: trae el mensaje del backend ({"mensaje": "..."}) y el código HTTP. */
export class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

/** Convierte un objeto de filtros en query string, omitiendo los valores vacíos. */
export function construirQuery(filtros = {}) {
  const parametros = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      parametros.set(clave, valor);
    }
  });

  const texto = parametros.toString();
  return texto ? `?${texto}` : '';
}

async function peticion(ruta, opciones = {}) {
  const sesion = obtenerSesion();

  const encabezados = { 'Content-Type': 'application/json', ...opciones.headers };
  if (sesion?.token) {
    encabezados.Authorization = `Bearer ${sesion.token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, { ...opciones, headers: encabezados });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.', 0);
  }

  // Sesión vencida: solo si la petición llevaba un token (si no lo llevaba, el 401 es
  // simplemente "credenciales inválidas" en login, no una sesión que expiró).
  if (respuesta.status === 401 && sesion?.token) {
    limpiarSesion();
    window.location.href = '/login?sesionVencida=1';
    throw new ErrorApi('Tu sesión expiró. Inicia sesión de nuevo.', 401);
  }

  if (respuesta.status === 204) {
    return null;
  }

  const esJson = respuesta.headers.get('content-type')?.includes('application/json');
  const cuerpo = esJson ? await respuesta.json().catch(() => null) : null;

  if (!respuesta.ok) {
    throw new ErrorApi(cuerpo?.mensaje ?? `Error inesperado (${respuesta.status}).`, respuesta.status);
  }

  return cuerpo;
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) => peticion(ruta, { method: 'POST', body: JSON.stringify(cuerpo) }),
  put: (ruta, cuerpo) => peticion(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  patch: (ruta, cuerpo) => peticion(ruta, { method: 'PATCH', body: JSON.stringify(cuerpo) }),
  delete: (ruta) => peticion(ruta, { method: 'DELETE' }),
};
