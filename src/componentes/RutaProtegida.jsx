import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexto/useAuth';

/*
 * Envuelve las rutas que exigen sesión.
 *
 * No hace falta recordar a dónde iba: tras iniciar sesión, `rutaInicioDe()` devuelve
 * al usuario a su sitio natural (panel o dashboard). El único caso que sí necesita
 * memoria es "Comprar" sin sesión, y de eso se encarga `redireccionPendiente`.
 *
 * `replace` evita que el botón Atrás vuelva a entrar en la ruta protegida y rebote
 * en bucle contra el login.
 */
function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, esAdmin } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Un usuario normal que escriba /dashboard a mano vuelve a su panel, no ve un error.
  if (soloAdmin && !esAdmin) {
    return <Navigate to="/panel" replace />;
  }

  return children;
}

export default RutaProtegida;
