import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Inicio_sesion.module.css';

const InicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@teatro.com' && password === 'admin123') {
      alert('Inicio de sesión exitoso: Redirigiendo a Admin Dashboard');
    } else if (email === 'maria@email.com' && password === 'user123') {
      alert('Inicio de sesión exitoso: Redirigiendo a Cartelera');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className={styles.loginPage}>
      

      <header className={styles.navbar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>

            <svg viewBox="0 0 24 24" fill="white" width="20px" height="20px">
              <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z"/>
            </svg>
          </div>
          <span className={styles.logoText}>Teatro <span className={styles.logoHighlight}>Luminaria</span></span>
        </div>
        <nav className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Cartelera</Link>
          <Link to="/login" className={styles.btnText}>Iniciar sesión</Link>
          <button className={styles.btnPrimary}>Registrarse</button>
        </nav>
      </header>

      <div className={styles.mainContent}>
        
        <div className={styles.logoAndText}>
          <div className={styles.brand}>
            <span className={styles.logoCircle}>
              {/* Aquí también reemplazamos la casita por el SVG */}
              <svg viewBox="0 0 24 24" fill="white" width="20px" height="20px">
                <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z"/>
              </svg>
            </span>
            <h1 className={styles.brandTitle}>Teatro <span>Luminaria</span></h1>
          </div>
          <h2 className={styles.welcomeText}>Bienvenido de nuevo</h2>
          <p className={styles.subWelcome}>Inicia sesión para comprar tus entradas</p>
        </div>

        <div className={styles.loginFormContainer}>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Iniciar sesión
            </button>

            <div className={styles.credentialsBox}>
              <p>Credenciales de prueba:</p>
              <p>Usuario: maria@email.com / user123</p>
              <p>Admin: admin@teatro.com / admin123</p>
            </div>
          </form>
        </div>

        <p className={styles.registerLink}>
          ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
        </p>

      </div>
    </div>
  );
};

export default InicioSesion;
