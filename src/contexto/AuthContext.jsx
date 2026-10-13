import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './contextos';
import { useData } from './useData';
import { esRolAdmin } from '../utilidades/roles';

const CLAVE_SESION = 'luminaria_sesion_v1';

/*
 * Se guarda SOLO el id del usuario, nunca el objeto entero. El mock lleva las
 * contraseñas en claro y no tiene sentido dejarlas escritas en localStorage;
 * además, así el rol o el nombre siempre se leen de la fuente real.
 */
function leerIdGuardado() {
  try {
    const bruto = localStorage.getItem(CLAVE_SESION);
    if (!bruto) return null;

    const sesion = JSON.parse(bruto);
    return typeof sesion?.id === 'string' ? sesion.id : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const { usuarios, agregarUsuario } = useData();

  // Inicializador perezoso: la sesión está resuelta ya en el primer render, así que
  // recargar en /panel o /dashboard no expulsa al usuario al login ni un instante.
  const [usuarioId, setUsuarioId] = useState(leerIdGuardado);

  // Ruta a la que volver después de iniciar sesión. Se guarda aquí y no en el estado
  // de navegación para que sobreviva a pasar por /registro.
  const [redireccionPendiente, setRedireccionPendiente] = useState(null);

  // El usuario se resuelve contra la lista real. Si el id guardado ya no existe
  // (por ejemplo porque cambió la semilla), la sesión queda cerrada en vez de fantasma.
  const usuario = useMemo(
    () => usuarios.find((candidato) => candidato.id === usuarioId) ?? null,
    [usuarios, usuarioId],
  );

  useEffect(() => {
    try {
      if (usuario) {
        localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: usuario.id }));
      } else {
        localStorage.removeItem(CLAVE_SESION);
      }
    } catch {
      // Sin persistencia la sesión dura lo que dure la pestaña.
    }
  }, [usuario]);

  /** Devuelve el usuario encontrado, o null si las credenciales no son válidas. */
  const login = useCallback(
    (correo, contrasena) => {
      const correoLimpio = correo.trim().toLowerCase();
      const encontrado = usuarios.find(
        (candidato) =>
          candidato.correo.toLowerCase() === correoLimpio && candidato.contrasena === contrasena,
      );

      if (!encontrado) return null;

      setUsuarioId(encontrado.id);
      return encontrado;
    },
    [usuarios],
  );

  /** Devuelve { ok: true, usuario } o { ok: false, error }. */
  const registrar = useCallback(
    (nombre, correo, contrasena) => {
      const correoLimpio = correo.trim().toLowerCase();

      if (usuarios.some((candidato) => candidato.correo.toLowerCase() === correoLimpio)) {
        return { ok: false, error: 'Este correo electrónico ya está registrado.' };
      }

      const nuevoUsuario = {
        id: `u${Date.now()}`,
        nombre: nombre.trim(),
        correo: correoLimpio,
        contrasena,
        rol: 'usuario',
        registradoEn: new Date().toISOString(),
      };

      agregarUsuario(nuevoUsuario);
      setUsuarioId(nuevoUsuario.id);

      return { ok: true, usuario: nuevoUsuario };
    },
    [usuarios, agregarUsuario],
  );

  const logout = useCallback(() => {
    setUsuarioId(null);
    setRedireccionPendiente(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      esAdmin: esRolAdmin(usuario),
      login,
      registrar,
      logout,
      redireccionPendiente,
      fijarRedireccionPendiente: setRedireccionPendiente,
      limpiarRedireccionPendiente: () => setRedireccionPendiente(null),
    }),
    [usuario, login, registrar, logout, redireccionPendiente],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
