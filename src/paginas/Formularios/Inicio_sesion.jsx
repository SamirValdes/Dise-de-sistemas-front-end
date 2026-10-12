import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styles from './Inicio_sesion.module.css';

const InicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@teatro.com' && password === 'admin123') {
      navigate('/admin-dashboard');
    } else if (email === 'maria@email.com' && password === 'user123') {
      navigate('/cartelera');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className={styles.loginPage}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.loginFormContainer}>
          <div className={styles.logoAndText}>
            <div className={styles.brand}>
              <div className={styles.logoCircle}>🏠</div>
              <h1 className={styles.brandTitle}>Teatro <span>Luminaria</span></h1>
            </div>
            <h2 className={styles.welcomeText}>Bienvenido de nuevo</h2>
            <p className={styles.subWelcome}>Inicia sesión para comprar tus entradas</p>
          </div>

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

          <p className={styles.registerLink}>
            ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InicioSesion;