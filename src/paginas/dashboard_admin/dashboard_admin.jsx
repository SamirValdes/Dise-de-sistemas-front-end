import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexto/useAuth';
import { useData } from '../../contexto/useData';
import { formatearMarcaTiempoCorta } from '../../utilidades/fechas';
import { etiquetaEstado, formatearPrecio } from '../../utilidades/precios';
import { etiquetaRol, inicialDe } from '../../utilidades/roles';
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

  /*
   * Todas las cifras salen de las compras y los usuarios reales del contexto.
   * Antes estaban escritas a mano y no cambiaban por mucho que se compraran entradas.
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

  const usuariosOrdenados = [...usuarios].sort(
    (a, b) => new Date(b.registradoEn) - new Date(a.registradoEn),
  );

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

          {/* Tarjetas de estadísticas */}
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
            {/* Gráfico de barras */}
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

            {/* Lista de eventos */}
            <div className="events-panel" ref={refEventos}>
              <div className="panel-header">
                <h3>Estado de eventos</h3>
              </div>
              <ul className="events-list">
                {eventos.map((evento) => {
                  const vendidas = compras
                    .filter((compra) => compra.eventoId === evento.id)
                    .reduce((suma, compra) => suma + compra.asientos.length, 0);

                  return (
                    <li key={evento.id}>
                      <div className="ev-info">
                        <span
                          className={`ev-dot ${evento.estado === 'activo' ? 'green' : 'red'}`}
                        ></span>
                        <div>
                          <p className="ev-name">{evento.nombre}</p>
                          <p className="ev-tickets">
                            {vendidas} {vendidas === 1 ? 'vendida' : 'vendidas'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`badge ${evento.estado === 'activo' ? 'badge-active' : 'badge-soon'}`}
                      >
                        {etiquetaEstado(evento.estado)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Compras recientes */}
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

          {/* Usuarios registrados */}
          <div className="recent-panel" ref={refUsuarios}>
            <div className="panel-header">
              <h3>Usuarios registrados</h3>
              <span className="panel-subtitle">{usuarios.length} cuentas</span>
            </div>

            <div className="table-responsive">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>CORREO</th>
                    <th>ROL</th>
                    <th>REGISTRO</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosOrdenados.map((cuenta) => (
                    <tr key={cuenta.id}>
                      <td>{cuenta.nombre}</td>
                      <td className="tx-seats">{cuenta.correo}</td>
                      <td>
                        <span
                          className={`badge ${cuenta.rol === 'usuario' ? 'badge-soon' : 'badge-active'}`}
                        >
                          {etiquetaRol(cuenta)}
                        </span>
                      </td>
                      <td className="tx-date">
                        {formatearMarcaTiempoCorta(cuenta.registradoEn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
