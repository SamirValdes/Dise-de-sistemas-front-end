import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useAuth } from '../../contexto/useAuth';
import { rutaInicioDe } from '../../utilidades/roles';
import estilos from './Inicio_sesion.module.css';

const IconoCasa = () => (
  <svg viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
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

function InicioSesion() {
  const { usuario, login, redireccionPendiente, limpiarRedireccionPendiente } = useAuth();
  const navegar = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión, esta pantalla no tiene sentido: se sale a donde corresponda.
  // Se respeta la redirección pendiente para no perder el evento que se iba a comprar.
  if (usuario) {
    return <Navigate to={redireccionPendiente ?? rutaInicioDe(usuario)} replace />;
  }

  const enviar = (evento) => {
    evento.preventDefault();
    setError('');
    setCargando(true);

    // Pequeña espera para que el estado de carga se perciba, como en el prototipo.
    setTimeout(() => {
      const usuarioValidado = login(correo, contrasena);

      if (!usuarioValidado) {
        setError('Correo o contraseña incorrectos.');
        setCargando(false);
        return;
      }

      const destino = redireccionPendiente ?? rutaInicioDe(usuarioValidado);
      limpiarRedireccionPendiente();
      navegar(destino, { replace: true });
    }, 400);
  };

  return (
    <div className={estilos.loginPage}>
      <Navbar />

      <div className={estilos.mainContent}>
        <div className={estilos.logoAndText}>
          <div className={estilos.brand}>
            <span className={estilos.logoCircle}>
              <IconoCasa />
            </span>
            <h1 className={estilos.brandTitle}>
              Teatro <span>Luminaria</span>
            </h1>
          </div>
          <h2 className={estilos.welcomeText}>Bienvenido de nuevo</h2>
          <p className={estilos.subWelcome}>Inicia sesión para comprar tus entradas</p>
        </div>

        <div className={estilos.loginFormContainer}>
          <form onSubmit={enviar} className={estilos.form}>
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
                placeholder="••••••••"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="current-password"
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
              {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div className={estilos.credentialsBox}>
              <p>Credenciales de prueba:</p>
              <p className={estilos.credencial}>Usuario: maria@email.com / user123</p>
              <p className={estilos.credencial}>Admin: admin@teatro.com / admin123</p>
              <p className={estilos.credencial}>Empleado: roberto@teatro.com / emp123</p>
            </div>
          </form>
        </div>

        <p className={estilos.registerLink}>
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default InicioSesion;
