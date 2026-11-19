import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexto/useAuth';
import { useData } from '../../contexto/useData';
import { eventos as serviciosEventos } from '../../servicios/eventos';
import { usuarios as serviciosUsuarios } from '../../servicios/usuarios';
import { formatearMarcaTiempoCorta } from '../../utilidades/fechas';
import { formatearPrecio } from '../../utilidades/precios';
import { inicialDe } from '../../utilidades/roles';
import FormularioEvento from './FormularioEvento';
import './dashboard_admin.css';

/** Etiqueta corta para el gráfico, donde no cabe el nombre completo. */
function nombreCorto(nombre) {
  return nombre.split(' ').slice(0, 2).join(' ');
}

export default function Dashboard() {
  const navegar = useNavigate();
  const { usuario, logout } = useAuth();
  const { eventos, usuarios, compras } = useData();

  const refEventos = useRef(null);
  const refUsuarios = useRef(null);

  // --- Eventos: conectados a la API (listar incluye Borrador porque la pide un admin) ---
  const [eventosApi, setEventosApi] = useState([]);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [errorEventos, setErrorEventos] = useState('');
  const [avisoEventos, setAvisoEventos] = useState('');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [eventoEnEdicion, setEventoEnEdicion] = useState(null);

  const cargarEventos = useCallback(async () => {
    setCargandoEventos(true);
    setErrorEventos('');
    try {
      const datos = await serviciosEventos.listar();
      setEventosApi(datos);
    } catch (err) {
      setErrorEventos(err.message);
    } finally {
      setCargandoEventos(false);
    }
  }, []);

  useEffect(() => {
    async function cargar() {
      await cargarEventos();
    }

    cargar();
  }, [cargarEventos]);

  const abrirCrear = () => {
    setEventoEnEdicion(null);
    setFormularioAbierto(true);
    setAvisoEventos('');
  };

  const abrirEditar = (evento) => {
    setEventoEnEdicion(evento);
    setFormularioAbierto(true);
    setAvisoEventos('');
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setEventoEnEdicion(null);
  };

  const guardarEvento = async (datos) => {
    if (eventoEnEdicion) {
      await serviciosEventos.actualizar(eventoEnEdicion.id, datos);
    } else {
      await serviciosEventos.crear(datos);
    }
    cerrarFormulario();
    await cargarEventos();
  };

  const cambiarEstadoEvento = async (evento, nuevoEstado) => {
    setAvisoEventos('');
    try {
      await serviciosEventos.cambiarEstado(evento.id, nuevoEstado);
      await cargarEventos();
    } catch (err) {
      setAvisoEventos(err.message);
    }
  };

  const eliminarEvento = async (evento) => {
    setAvisoEventos('');
    try {
      await serviciosEventos.eliminar(evento.id);
      await cargarEventos();
    } catch (err) {
      // Ej.: 409 "No se puede eliminar un evento que ya tiene compras."
      setAvisoEventos(err.message);
    }
  };

  // --- Usuarios: conectados a GET /api/usuarios ---
  const [usuariosApi, setUsuariosApi] = useState([]);
  const [cargandoUsuariosApi, setCargandoUsuariosApi] = useState(true);
  const [errorUsuariosApi, setErrorUsuariosApi] = useState('');

  useEffect(() => {
    async function cargarUsuarios() {
      setCargandoUsuariosApi(true);
      setErrorUsuariosApi('');
      try {
        const datos = await serviciosUsuarios.listar();
        setUsuariosApi(datos);
      } catch (err) {
        setErrorUsuariosApi(err.message);
      } finally {
        setCargandoUsuariosApi(false);
      }
    }

    cargarUsuarios();
  }, []);

  /*
   * Las cifras de esta sección (tarjetas, gráfico y compras recientes) son métricas:
   * quedan fuera de esta integración y se dejan con los datos locales de siempre.
   */
  const ingresosTotales = compras.reduce((suma, compra) => suma + compra.total, 0);
  const entradasVendidas = compras.reduce(
    (suma, compra) => suma + compra.asientos.length,
    0,
  );
  const eventosConVentas = new Set(compras.map((compra) => compra.eventoId)).size;
  const eventosActivos = eventos.filter((evento) => evento.estado === 'activo').length;
  const eventosProximos = eventos.length - eventosActivos;

  const stats = [
    {
      id: 1,
      title: 'INGRESOS TOTALES',
      value: formatearPrecio(ingresosTotales),
      subtitle: `${compras.length} ${compras.length === 1 ? 'compra registrada' : 'compras registradas'}`,
      icon: '$',
      isPositive: true,
    },
    {
      id: 2,
      title: 'ENTRADAS VENDIDAS',
      value: String(entradasVendidas),
      subtitle: `en ${eventosConVentas} ${eventosConVentas === 1 ? 'evento' : 'eventos'}`,
      icon: '🎫',
      isPositive: true,
    },
    {
      id: 3,
      title: 'USUARIOS REGISTRADOS',
      value: String(usuarios.length),
      subtitle: `${usuarios.filter((u) => u.rol === 'usuario').length} con cuenta de usuario`,
      icon: '👥',
      isPositive: true,
    },
    {
      id: 4,
      title: 'EVENTOS ACTIVOS',
      value: `${eventosActivos} / ${eventos.length}`,
      subtitle: `${eventosProximos} próximos`,
      icon: '📅',
      isPositive: true,
    },
  ];

  // Entradas vendidas por evento. El gráfico era "por semana", pero las compras de
  // ejemplo caen todas en la misma semana y quedaba una sola barra.
  const ventasPorEvento = eventos.map((evento) => ({
    id: evento.id,
    etiqueta: nombreCorto(evento.nombre),
    valor: compras
      .filter((compra) => compra.eventoId === evento.id)
      .reduce((suma, compra) => suma + compra.asientos.length, 0),
  }));

  const maxVentas = Math.max(...ventasPorEvento.map((venta) => venta.valor), 1);

  const comprasRecientes = [...compras]
    .sort((a, b) => new Date(b.compradaEn) - new Date(a.compradaEn))
    .slice(0, 5);

  const irA = (referencia) => {
    if (!referencia.current) return;
    const altura = referencia.current.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: altura, behavior: 'smooth' });
  };

  const cerrarSesion = () => {
    logout();
    navegar('/login');
  };

  return (
    <div className="dashboard-wrapper">
      {/* --- NAVEGACIÓN SUPERIOR --- */}
      <nav className="dash-topbar">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="16px" height="16px">
              <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z" />
            </svg>
          </div>
          <span className="logo-text">
            Teatro <span className="logo-highlight">Luminaria</span>
          </span>
        </div>
        <div className="dash-top-links">
          <button type="button" className="active-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Dashboard
          </button>
          <button type="button" onClick={() => irA(refEventos)}>
            Eventos
          </button>
          <button type="button" onClick={() => irA(refUsuarios)}>
            Usuarios
          </button>
          <div className="user-profile">
            <div className="avatar">{inicialDe(usuario)}</div>
            <span>{usuario?.nombre ?? 'Admin'}</span>
          </div>
          <button type="button" className="btn-logout" onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </nav>

      <div className="dash-body">
        {/* --- BARRA LATERAL --- */}
        <aside className="dash-sidebar">
          <div className="sidebar-menu">
            <p className="sidebar-title">PANEL ADMINISTRATIVO</p>
            <button
              type="button"
              className="sidebar-item active"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="icon">❖</span> Dashboard
            </button>
            <button type="button" className="sidebar-item" onClick={() => irA(refEventos)}>
              <span className="icon">📅</span> Eventos
            </button>
            <button type="button" className="sidebar-item" onClick={() => irA(refUsuarios)}>
              <span className="icon">👥</span> Usuarios
            </button>
          </div>
          <div className="sidebar-footer">
            <span className="status-dot"></span> Sistema activo
          </div>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="dash-main">
          <header className="dash-header">
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Bienvenido, {usuario?.nombre ?? 'Admin'}</p>
          </header>

          {/* Tarjetas de estadísticas (métricas: datos locales, fuera de esta integración) */}
          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.id}>
                <div className="stat-top">
                  <span className="stat-label">{stat.title}</span>
                  <div className="stat-icon">{stat.icon}</div>
                </div>
                <h2 className="stat-value">{stat.value}</h2>
                <p className={`stat-trend ${stat.isPositive ? 'positive' : ''}`}>
                  {stat.subtitle}
                </p>
              </div>
            ))}
          </div>

          <div className="charts-container">
            {/* Gráfico de barras (métrica: datos locales) */}
            <div className="chart-panel">
              <div className="panel-header">
                <h3>Entradas vendidas por evento</h3>
                <span className="panel-subtitle">{eventos.length} eventos</span>
              </div>
              <div className="bar-chart">
                {ventasPorEvento.map((venta) => (
                  <div className="bar-col" key={venta.id}>
                    <span className="bar-val">{venta.valor}</span>
                    <div
                      className="bar"
                      style={{
                        height: `${Math.max((venta.valor / maxVentas) * 100, venta.valor > 0 ? 8 : 2)}%`,
                      }}
                    ></div>
                    <span className="bar-label">{venta.etiqueta}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gestión de eventos: conectada a la API */}
            <div className="events-panel" ref={refEventos}>
              <div className="panel-header">
                <h3>Gestión de eventos</h3>
                <button type="button" className="btn-admin" onClick={abrirCrear}>
                  + Nuevo evento
                </button>
              </div>

              {avisoEventos && <p className="admin-form-error">{avisoEventos}</p>}

              {formularioAbierto && (
                <FormularioEvento
                  eventoEnEdicion={eventoEnEdicion}
                  alGuardar={guardarEvento}
                  alCancelar={cerrarFormulario}
                />
              )}

              {errorEventos ? (
                <p className="admin-form-error">{errorEventos}</p>
              ) : cargandoEventos ? (
                <p className="panel-subtitle">Cargando eventos…</p>
              ) : (
                <ul className="events-list">
                  {eventosApi.map((evento) => (
                    <li key={evento.id} className="events-list-item">
                      <div className="ev-info">
                        <span className={`ev-dot ${evento.estado === 'Publicado' ? 'green' : 'red'}`}></span>
                        <div>
                          <p className="ev-name">{evento.nombre}</p>
                          <p className="ev-tickets">
                            {evento.asientosTotales - evento.asientosDisponibles} vendidas de{' '}
                            {evento.asientosTotales}
                          </p>
                        </div>
                      </div>

                      <div className="ev-acciones">
                        <select
                          className="select-estado"
                          value={evento.estado}
                          onChange={(cambio) => cambiarEstadoEvento(evento, cambio.target.value)}
                          aria-label={`Estado de ${evento.nombre}`}
                        >
                          <option value="Borrador">Borrador</option>
                          <option value="Publicado">Publicado</option>
                          <option value="Cancelado">Cancelado</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                        <button type="button" className="btn-admin-chico" onClick={() => abrirEditar(evento)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-admin-chico btn-admin-peligro"
                          onClick={() => eliminarEvento(evento)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Compras recientes (métrica: datos locales) */}
          <div className="recent-panel">
            <div className="panel-header">
              <h3>Compras recientes</h3>
              <span className="panel-subtitle">
                {comprasRecientes.length} últimas transacciones
              </span>
            </div>

            <div className="table-responsive">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>CÓDIGO</th>
                    <th>EVENTO</th>
                    <th>ASIENTOS</th>
                    <th>TOTAL</th>
                    <th>FECHA</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasRecientes.map((compra) => (
                    <tr key={compra.id}>
                      <td className="tx-code">{compra.codigoEntrada}</td>
                      <td>
                        {eventos.find((evento) => evento.id === compra.eventoId)?.nombre ?? '—'}
                      </td>
                      <td className="tx-seats">{compra.asientos.join(', ')}</td>
                      <td className="tx-total">{formatearPrecio(compra.total)}</td>
                      <td className="tx-date">{formatearMarcaTiempoCorta(compra.compradaEn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Usuarios registrados: conectado a GET /api/usuarios */}
          <div className="recent-panel" ref={refUsuarios}>
            <div className="panel-header">
              <h3>Usuarios registrados</h3>
              <span className="panel-subtitle">{usuariosApi.length} cuentas</span>
            </div>

            {errorUsuariosApi ? (
              <p className="admin-form-error">{errorUsuariosApi}</p>
            ) : cargandoUsuariosApi ? (
              <p className="panel-subtitle">Cargando usuarios…</p>
            ) : (
              <div className="table-responsive">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>NOMBRE</th>
                      <th>CORREO</th>
                      <th>ESTADO</th>
                      <th>REGISTRO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosApi.map((cuenta) => (
                      <tr key={cuenta.correo}>
                        <td>{cuenta.nombre}</td>
                        <td className="tx-seats">{cuenta.correo}</td>
                        <td>
                          <span className={`badge ${cuenta.estado === 'Activo' ? 'badge-active' : 'badge-soon'}`}>
                            {cuenta.estado}
                          </span>
                        </td>
                        <td className="tx-date">{formatearMarcaTiempoCorta(cuenta.fechaRegistro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
