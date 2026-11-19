import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './contextos';
import { auth } from '../servicios/auth';
import { esRolAdmin } from '../utilidades/roles';
import { guardarSesion, limpiarSesion, obtenerSesion } from '../servicios/sesion';

export function AuthProvider({ children }) {
  // Inicializador perezoso: si hay una sesión guardada, el usuario está disponible
  // ya en el primer render (sin esperar a la API), igual que hacía la versión local.
  const [usuario, setUsuario] = useState(() => obtenerSesion()?.usuario ?? null);

  // Ruta a la que volver después de iniciar sesión. Se guarda aquí y no en el estado
  // de navegación para que sobreviva a pasar por /registro.
  const [redireccionPendiente, setRedireccionPendiente] = useState(null);

  /*
   * Al montar, si hay un token guardado se refresca el usuario contra GET /api/auth/me:
   * así el nombre/rol siempre reflejan la base de datos, y si el token ya venció, api.js
   * limpia la sesión y redirige a /login (aquí solo hace falta vaciar el estado local).
   */
  useEffect(() => {
    const sesion = obtenerSesion();
    if (!sesion?.token) return;

    auth
      .me()
      .then((datosUsuario) => {
        setUsuario(datosUsuario);
        guardarSesion(sesion.token, datosUsuario);
      })
      .catch(() => setUsuario(null));
  }, []);

  /** Lanza ErrorApi si las credenciales son inválidas (401) o la cuenta está inactiva (403). */
  const login = useCallback(async (correo, contrasena) => {
    const { token, usuario: datosUsuario } = await auth.login(correo, contrasena);
    guardarSesion(token, datosUsuario);
    setUsuario(datosUsuario);
    return datosUsuario;
  }, []);

  /*
   * El registro (POST /api/auth/registro) crea la cuenta pero no devuelve token, así que
   * se inicia sesión aparte para que, de cara a quien usa la app, siga siendo un solo paso.
   * Lanza ErrorApi si el correo ya existe (409) o los datos no son válidos (400).
   */
  const registrar = useCallback(
    async (nombre, correo, contrasena) => {
      await auth.registro(nombre, correo, contrasena);
      return login(correo, contrasena);
    },
    [login],
  );

  const logout = useCallback(() => {
    limpiarSesion();
    setUsuario(null);
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
