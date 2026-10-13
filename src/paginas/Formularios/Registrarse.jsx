import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useAuth } from '../../contexto/useAuth';
import { rutaInicioDe } from '../../utilidades/roles';
import estilos from './Registrarse.module.css';

const IconoCasa = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="white" aria-hidden="true">
    <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z" />
  </svg>
);

const IconoAviso = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function Registrarse() {
  const { usuario, registrar, redireccionPendiente, limpiarRedireccionPendiente } = useAuth();
  const navegar = useNavigate();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) {
    return <Navigate to={redireccionPendiente ?? rutaInicioDe(usuario)} replace />;
  }

  const enviar = (evento) => {
    evento.preventDefault();
    setError('');

    if (contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    setTimeout(() => {
      const resultado = registrar(nombre, correo, contrasena);

      if (!resultado.ok) {
        setError(resultado.error);
        setCargando(false);
        return;
      }

      // Al registrarse también se respeta el evento que se iba a comprar.
      const destino = redireccionPendiente ?? rutaInicioDe(resultado.usuario);
      limpiarRedireccionPendiente();
      navegar(destino, { replace: true });
    }, 400);
  };

  return (
    <div className={estilos.registerPage}>
      <Navbar />

      <div className={estilos.mainContent}>
        <div className={estilos.pageHeader}>
          <Link to="/" className={estilos.centerBrand}>
            <span className={estilos.logoCircle}>
              <IconoCasa />
            </span>
            <h1 className={estilos.brandTitle}>
              Teatro <span>Luminaria</span>
            </h1>
          </Link>
          <h2 className={estilos.welcomeText}>Crea tu cuenta</h2>
          <p className={estilos.subWelcome}>Únete y descubre el mejor teatro</p>
        </div>

        <div className={estilos.registerFormContainer}>
          <form onSubmit={enviar} className={estilos.form}>
            <div className={estilos.inputGroup}>
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className={estilos.inputGroup}>
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                placeholder="tu@email.com"
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={estilos.inputGroup}>
              <label htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className={estilos.inputGroup}>
              <label htmlFor="confirmacion">Confirmar contraseña</label>
              <input
                id="confirmacion"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmacion}
                onChange={(evento) => setConfirmacion(evento.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <p className={estilos.error} role="alert">
                <IconoAviso />
                {error}
              </p>
            )}

            <button type="submit" className={estilos.submitBtn} disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <div className={estilos.footerLink}>
          <p className={estilos.loginText}>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registrarse;
