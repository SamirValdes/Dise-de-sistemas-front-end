import React from 'react';
import { Link } from 'react-router-dom'; 
import './inicio.css';


const eventos = [
  {
    id: 1,
    categoria: 'Ópera',
    titulo: 'La Traviata',
    descripcion: 'La ópera maestra de Verdi',
    fecha: 'Jueves, 15 de Octubre de 2026',
    hora: '20:00 — 2h 45min',
    lugar: 'Sala Principal',
    precio: 45,
    estado: 'En venta'
  },
  {
    id: 2,
    categoria: 'Ballet',
    titulo: 'El Lago de los Cisnes',
    descripcion: 'Ballet clásico de Chaikovski',
    fecha: 'Miércoles, 28 de Octubre de 2026',
    hora: '19:30 — 2h 30min',
    lugar: 'Sala Principal',
    precio: 55,
    estado: 'En venta'
  },
  {
    id: 3,
    categoria: 'Concierto',
    titulo: 'Sinfonía No. 9 — Beethoven',
    descripcion: 'La obra cumbre del compositor alemán',
    fecha: 'Martes, 10 de Noviembre de 2026',
    hora: '20:30 — 1h 15min',
    lugar: 'Sala de Cámara',
    precio: 40,
    estado: 'En venta'
  },
  {
    id: 4,
    categoria: 'Musical',
    titulo: 'El Fantasma de la Ópera',
    descripcion: 'El musical más taquillero de la historia',
    fecha: 'Domingo, 22 de Noviembre de 2026',
    hora: '19:00 — 2h 30min',
    lugar: 'Sala Principal',
    precio: 65,
    estado: 'En venta'
  },
  {
    id: 5,
    categoria: 'Danza',
    titulo: 'Flamenco Nuevo',
    descripcion: 'Arte flamenco contemporáneo',
    fecha: 'Sábado, 5 de Diciembre de 2026',
    hora: '21:00 — 1h 30min',
    lugar: 'Sala Íntima',
    precio: 35,
    estado: 'Próximamente'
  },
  {
    id: 6,
    categoria: 'Teatro',
    titulo: 'Medea — Eurípides',
    descripcion: 'La tragedia griega clásica',
    fecha: 'Viernes, 18 de Diciembre de 2026',
    hora: '20:00 — 2h',
    lugar: 'Sala Principal',
    precio: 38,
    estado: 'Próximamente'
  }
];

function Inicio() {
  return (
    <div className="app-container">

      <header className="navbar">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="20px" height="20px">
              <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z"/>
            </svg>
          </div>
          <span className="logo-text">Teatro <span className="logo-highlight">Luminaria</span></span>
        </div>
        <nav className="nav-links">
          <a href="#cartelera" className="nav-link">Cartelera</a>
          <Link to="/login" className="btn-text">Iniciar sesión</Link>

          <Link to="/registro" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Registrarse</Link>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="season-subtitle">
            <span className="line"></span> TEMPORADA 2026-2027
          </p>
          <h1 className="hero-title">
            Teatro <br />
            <span className="hero-title-cursive">Luminaria</span>
          </h1>
          <p className="hero-description">
            Donde el arte cobra vida. Descubre nuestra cartelera y<br/>
            vive experiencias que trascienden el tiempo.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary large">Ver cartelera</button>

            <Link to="/registro" className="btn-outline large" style={{ textDecoration: 'none', display: 'inline-block' }}>Registrarse</Link>
          </div>
        </div>
      </main>


      <section className="upcoming-shows" id="cartelera">
        
        <div className="section-top">
          <div>
            <h2 className="section-title">Próximas Funciones</h2>
            <p className="section-subtitle-text">Selecciona un evento y elige tus asientos</p>
          </div>
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar eventos..." className="search-input" />
          </div>
        </div>

        <div className="filters-container">
          <button className="filter-pill active">Todos</button>
          <button className="filter-pill">Ópera</button>
          <button className="filter-pill">Ballet</button>
          <button className="filter-pill">Musical</button>
          <button className="filter-pill">Concierto</button>
          <button className="filter-pill">Teatro</button>
          <button className="filter-pill">Danza</button>
        </div>

        <div className="cards-grid">
          {eventos.map((evento) => (
            <div className="card" key={evento.id}>
              
              <div className="card-image-placeholder">
                <span className="tag-category">{evento.categoria}</span>

                <span className={`tag-status ${evento.estado === 'Próximamente' ? 'soon' : ''}`}>
                  {evento.estado}
                </span>
                <span className="image-comment">Imagen {evento.id} aquí</span>
              </div>

              <div className="card-content">
                <h3 className="card-title">{evento.titulo}</h3>
                <p className="card-desc">{evento.descripcion}</p>
                
                <ul className="card-info-list">
                  <li><span className="icon">📅</span> {evento.fecha}</li>
                  <li><span className="icon">⏰</span> {evento.hora}</li>
                  <li><span className="icon">📍</span> {evento.lugar}</li>
                </ul>

                <div className="card-footer">
                  <div className="price-info">
                    Desde <strong>${evento.precio}</strong> <span>/entrada</span>
                  </div>
                  <div className="card-buttons">
                    <button className="btn-outline-small">Detalles</button>

                    {evento.estado === 'En venta' && (
                      <button className="btn-primary-small">Comprar</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="20px" height="20px">
              <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z"/>
            </svg>
          </div>
          <span className="logo-text">Teatro <span className="logo-highlight">Luminaria</span></span>
        </div>
        <p className="copyright">© 2026 Teatro Luminaria. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}

export default Inicio;