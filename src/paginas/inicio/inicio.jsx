import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useAuth } from '../../contexto/useAuth';
import { useFavoritos } from '../../contexto/useFavoritos';
import { eventos as serviciosEventos } from '../../servicios/eventos';
import { formatearFechaLarga } from '../../utilidades/fechas';
import { etiquetaEstadoVenta, formatearPrecio } from '../../utilidades/precios';
import './inicio.css';

const IconoCasa = () => (
  <svg viewBox="0 0 24 24" fill="white" width="20" height="20" aria-hidden="true">
    <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z" />
  </svg>
);

const IconoCorazon = ({ relleno }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill={relleno ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function Inicio() {
  const navegar = useNavigate();
  const { usuario, fijarRedireccionPendiente } = useAuth();
  const { favoritosDeUsuario, alternarFavorito } = useFavoritos();

  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [categorias, setCategorias] = useState(['Todos']);
  const [eventosApi, setEventosApi] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Categorías de los filtros: se calculan una sola vez con el catálogo completo
  // (sin filtros), para que la lista de píldoras no cambie según lo que ya esté filtrado.
  useEffect(() => {
    serviciosEventos
      .listar()
      .then((datos) => setCategorias(['Todos', ...new Set(datos.map((evento) => evento.categoria))]))
      .catch(() => {
        // Si falla, se queda solo "Todos"; la carga de abajo ya informa el error real.
      });
  }, []);

  // Catálogo mostrado: usa los parámetros de la API (categoria, texto). El texto se
  // manda con un pequeño retraso para no disparar una petición por cada tecla.
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError('');

      try {
        const datos = await serviciosEventos.listar({
          categoria: categoria === 'Todos' ? undefined : categoria,
          texto: busqueda || undefined,
        });
        if (cancelado) return;
        setEventosApi(datos);
        setCargando(false);
      } catch (err) {
        if (cancelado) return;
        setError(err.message ?? 'No se pudieron cargar los eventos.');
        setCargando(false);
      }
    }

    const temporizador = setTimeout(cargar, busqueda ? 350 : 0);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [categoria, busqueda]);

  // Los favoritos son de cada usuario: sin sesión no hay ninguno que mostrar.
  const favoritos = favoritosDeUsuario(usuario?.id);

  /**
   * Comprar exige sesión. Si no la hay se recuerda el evento en el contexto y se
   * manda a iniciar sesión; al volver, el login redirige justo a ese evento.
   */
  const comprar = (evento) => {
    if (!usuario) {
      fijarRedireccionPendiente(`/evento/${evento.id}`);
      navegar('/login');
      return;
    }

    navegar(`/evento/${evento.id}`);
  };

  return (
    <div className="app-container">
      <Navbar />

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
            Donde el arte cobra vida. Descubre nuestra cartelera y<br />
            vive experiencias que trascienden el tiempo.
          </p>
          <div className="hero-buttons">
            <a href="#cartelera" className="btn-primary large">
              Ver cartelera
            </a>

            {!usuario && (
              <Link
                to="/registro"
                className="btn-outline large"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                Registrarse
              </Link>
            )}
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
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="search-input"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              aria-label="Buscar eventos"
            />
          </div>
        </div>

        <div className="filters-container">
          {categorias.map((nombreCategoria) => (
            <button
              key={nombreCategoria}
              type="button"
              onClick={() => setCategoria(nombreCategoria)}
              className={`filter-pill ${categoria === nombreCategoria ? 'active' : ''}`}
            >
              {nombreCategoria}
            </button>
          ))}
        </div>

        {error ? (
          <div className="sin-resultados">
            <p className="sin-resultados-titulo">No se pudo cargar la cartelera</p>
            <p className="sin-resultados-texto">{error}</p>
          </div>
        ) : cargando ? (
          <div className="sin-resultados">
            <p className="sin-resultados-titulo">Cargando eventos…</p>
          </div>
        ) : eventosApi.length === 0 ? (
          <div className="sin-resultados">
            <p className="sin-resultados-titulo">No se encontraron eventos</p>
            <p className="sin-resultados-texto">Prueba con otra categoría o búsqueda</p>
          </div>
        ) : (
          <div className="cards-grid">
            {eventosApi.map((evento) => (
              <div className="card" key={evento.id}>
                <div className="card-image-placeholder">
                  <span className="tag-category">{evento.categoria}</span>

                  <span className={`tag-status ${evento.estadoVenta !== 'EnVenta' ? 'soon' : ''}`}>
                    {etiquetaEstadoVenta(evento.estadoVenta)}
                  </span>

                  {usuario && (
                    <button
                      type="button"
                      className="btn-favorito"
                      onClick={() => alternarFavorito(usuario.id, evento.id)}
                      aria-label={
                        favoritos.includes(evento.id)
                          ? 'Quitar de favoritos'
                          : 'Añadir a favoritos'
                      }
                    >
                      <IconoCorazon relleno={favoritos.includes(evento.id)} />
                    </button>
                  )}

                  <span className="image-comment">{evento.categoria}</span>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{evento.nombre}</h3>
                  <p className="card-desc">{evento.descripcion}</p>

                  <ul className="card-info-list">
                    <li>
                      <span className="icon">📅</span> {formatearFechaLarga(evento.fecha)}
                    </li>
                    <li>
                      <span className="icon">⏰</span> {evento.hora.slice(0, 5)}
                      {evento.duracion ? ` — ${evento.duracion}` : ''}
                    </li>
                    <li>
                      <span className="icon">📍</span> {evento.sala ?? 'Por confirmar'}
                    </li>
                  </ul>

                  <div className="card-footer">
                    <div className="price-info">
                      Desde <strong>{formatearPrecio(evento.precioBase)}</strong>{' '}
                      <span>/entrada</span>
                    </div>
                    <div className="card-buttons">
                      <Link to={`/evento/${evento.id}`} className="btn-outline-small">
                        Detalles
                      </Link>

                      {evento.estadoVenta === 'EnVenta' && (
                        <button
                          type="button"
                          className="btn-primary-small"
                          onClick={() => comprar(evento)}
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="logo-container">
          <div className="logo-icon">
            <IconoCasa />
          </div>
          <span className="logo-text">
            Teatro <span className="logo-highlight">Luminaria</span>
          </span>
        </div>
        <p className="copyright">© 2026 Teatro Luminaria. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Inicio;
