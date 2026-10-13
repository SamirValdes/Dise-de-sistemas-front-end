import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/useAuth';
import { inicialDe, nombreCorto, rutaInicioDe } from '../utilidades/roles';
import estilos from './Navbar.module.css';

const IconoCasa = () => (
  <svg viewBox="0 0 24 24" fill="white" width="16" height="16" aria-hidden="true">
    <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z" />
  </svg>
);

/*
 * Barra de navegación única para toda la app.
 * Antes había tres copias del mismo header (inicio, login y registro) que no
 * sabían nada de la sesión; ahora una sola reacciona al estado de acceso.
 */
function Navbar() {
  const { usuario, esAdmin, logout } = useAuth();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    logout();
    setMenuAbierto(false);
    navegar('/login');
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const enlaceClase = (ruta) =>
    `${estilos.enlace} ${pathname === ruta ? estilos.enlaceActivo : ''}`;

  return (
    <header className={estilos.navbar}>
      <div className={estilos.interior}>
        <Link to="/" className={estilos.marca} onClick={cerrarMenu}>
          <span className={estilos.logoIcono}>
            <IconoCasa />
          </span>
          <span className={estilos.logoTexto}>
            Teatro <span className={estilos.logoAcento}>Luminaria</span>
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className={estilos.enlaces}>
          <Link to="/#cartelera" className={estilos.enlace}>
            Cartelera
          </Link>

          {usuario && (
            <Link to={rutaInicioDe(usuario)} className={enlaceClase(rutaInicioDe(usuario))}>
              {esAdmin ? 'Dashboard' : 'Mi Perfil'}
            </Link>
          )}

          {usuario ? (
            <div className={estilos.sesion}>
              <div className={estilos.usuario}>
                <span className={estilos.avatar}>{inicialDe(usuario)}</span>
                <span className={estilos.nombre}>{nombreCorto(usuario)}</span>
              </div>
              <button type="button" className={estilos.btnSalir} onClick={cerrarSesion}>
                Salir
              </button>
            </div>
          ) : (
            <div className={estilos.sesion}>
              <Link to="/login" className={estilos.enlace}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className={estilos.btnRegistro}>
                Registrarse
              </Link>
            </div>
          )}
        </nav>

        {/* Botón de menú en móvil */}
        <button
          type="button"
          className={estilos.hamburguesa}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuAbierto ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú desplegable en móvil */}
      {menuAbierto && (
        <div className={estilos.menuMovil}>
          <Link to="/#cartelera" className={estilos.enlaceMovil} onClick={cerrarMenu}>
            Cartelera
          </Link>

          {usuario && (
            <Link
              to={rutaInicioDe(usuario)}
              className={estilos.enlaceMovil}
              onClick={cerrarMenu}
            >
              {esAdmin ? 'Dashboard' : 'Mi Perfil'}
            </Link>
          )}

          <div className={estilos.separador} />

          {usuario ? (
            <button type="button" className={estilos.salirMovil} onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          ) : (
            <div className={estilos.accionesMovil}>
              <Link to="/login" className={estilos.btnMovilClaro} onClick={cerrarMenu}>
                Iniciar sesión
              </Link>
              <Link to="/registro" className={estilos.btnMovilAcento} onClick={cerrarMenu}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
