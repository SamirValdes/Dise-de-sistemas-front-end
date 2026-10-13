import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Registrarse.module.css';

const HouseIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    stroke="white" 
    strokeWidth="2.5" 
    fill="none" 
    strokeLinejoin="round"
  >
    <polygon points="12 4 4 11 4 20 20 20 20 11" />
  </svg>
);

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
    console.log('Registrando usuario:', { fullName, email, password });

    navigate('/');
  };

  return (
    <div className={styles.registerPage}>
      
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navBrand}>
          <div className={styles.logoCircle}>
            <HouseIcon />
          </div>
          <h1 className={styles.brandTitle}>Teatro <span>Luminaria</span></h1>
        </Link>
        
        <div className={styles.navActions}>

          <Link to="/" className={styles.navLink}>Cartelera</Link>
          

          <Link to="/login" className={styles.navLink}>Iniciar sesión</Link>
          
          <button className={styles.navRegisterBtn}>Registrarse</button>
        </div>
      </nav>

      <div className={styles.mainContent}>
        
        <div className={styles.pageHeader}>
          <Link to="/" className={styles.centerBrand}>
            <div className={styles.logoCircle}>
              <HouseIcon />
            </div>
            <h1 className={styles.brandTitle}>Teatro <span>Luminaria</span></h1>
          </Link>
          <h2 className={styles.welcomeText}>Crea tu cuenta</h2>
          <p className={styles.subWelcome}>Únete y descubre el mejor teatro</p>
        </div>

        <div className={styles.registerFormContainer}>
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
        </div>

        <div className={styles.footerLink}>
          <p className={styles.loginText}>

            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Registrarse;