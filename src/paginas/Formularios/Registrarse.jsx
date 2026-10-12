import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import styles from './Registrarse.module.css';

const Registrarse = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Lógica de registro simulada
    console.log('Registrando usuario:', { fullName, email, password });
    navigate('/cartelera');
  };

  return (
    <div className={styles.registerPage}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.registerFormContainer}>
          <div className={styles.logoAndText}>
            <div className={styles.brand}>
              <div className={styles.logoCircle}>🏠</div>
              <h1 className={styles.brandTitle}>Teatro <span>Luminaria</span></h1>
            </div>
            <h2 className={styles.welcomeText}>Crea tu cuenta</h2>
            <p className={styles.subWelcome}>Únete y descubre el mejor teatro</p>
          </div>

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Crear cuenta
            </button>
          </form>

          <p className={styles.loginLink}>
            ¿Ya tienes una cuenta? <a href="/iniciar-sesion">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registrarse;