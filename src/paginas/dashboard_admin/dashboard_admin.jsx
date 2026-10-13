import React from 'react';
import './dashboard.css';

export default function Dashboard() {
  const stats = [
    { id: 1, title: 'INGRESOS TOTALES', value: '$705', subtitle: '+12% este mes', icon: '$', isPositive: true },
    { id: 2, title: 'ENTRADAS VENDIDAS', value: '12', subtitle: '+8% esta semana', icon: '🎫', isPositive: true },
    { id: 3, title: 'USUARIOS REGISTRADOS', value: '5', subtitle: '+23 nuevos', icon: '👥', isPositive: true },
    { id: 4, title: 'EVENTOS ACTIVOS', value: '4 / 6', subtitle: '2 próximos', icon: '📅', isPositive: true },
  ];

  const chartData = [
    { sem: 'Sem 1', val: 87, height: '30%' },
    { sem: 'Sem 2', val: 124, height: '45%' },
    { sem: 'Sem 3', val: 98, height: '35%' },
    { sem: 'Sem 4', val: 156, height: '55%' },
    { sem: 'Sem 5', val: 211, height: '80%' },
    { sem: 'Sem 6', val: 178, height: '65%' },
    { sem: 'Sem 7', val: 203, height: '75%' },
    { sem: 'Sem 8', val: 190, height: '70%' },
  ];

  const eventos = [
    { id: 1, name: 'La Traviata', tickets: '23 vendidas', status: 'Activo' },
    { id: 2, name: 'El Lago de los Cisnes', tickets: '14 vendidas', status: 'Activo' },
    { id: 3, name: 'Sinfonía No. 9 — Beethoven', tickets: '11 vendidas', status: 'Activo' },
    { id: 4, name: 'El Fantasma de la Ópera', tickets: '22 vendidas', status: 'Activo' },
    { id: 5, name: 'Flamenco Nuevo', tickets: '0 vendidas', status: 'Próximo' },
    { id: 6, name: 'Medea — Eurípides', tickets: '0 vendidas', status: 'Próximo' },
  ];

  const comprasRecientes = [
    { id: 'TL-Q7R8S9T0', evento: 'Sinfonía No. 9 — Beethoven', asientos: 'E1, E2, E3', total: '$120.00', fecha: '5 sept' },
    { id: 'TL-M3N405P6', evento: 'El Fantasma de la Ópera', asientos: 'B1, B2', total: '$195.00', fecha: '4 sept' },
    { id: 'TL-E5F6G7H8', evento: 'El Lago de los Cisnes', asientos: 'A3, A4', total: '$165.00', fecha: '3 sept' },
    { id: 'TL-I9J0K1L2', evento: 'La Traviata', asientos: 'H1, H2, H3', total: '$135.00', fecha: '2 sept' },
    { id: 'TL-A4B2C3D1', evento: 'La Traviata', asientos: 'D5, D6', total: '$90.00', fecha: '1 sept' }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* --- NAVEGACIÓN SUPERIOR --- */}
      <nav className="dash-topbar">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="16px" height="16px">
              <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5l6 4.5v9h-12v-9l6-4.5z"/>
            </svg>
          </div>
          <span className="logo-text">Teatro <span className="logo-highlight">Luminaria</span></span>
        </div>
        <div className="dash-top-links">
          <span className="active-link">Dashboard</span>
          <span>Eventos</span>
          <span>Usuarios</span>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
          <button className="btn-logout">Salir</button>
        </div>
      </nav>

      <div className="dash-body">
        {/* --- BARRA LATERAL --- */}
        <aside className="dash-sidebar">
          <div className="sidebar-menu">
            <p className="sidebar-title">PANEL ADMINISTRATIVO</p>
            <button className="sidebar-item active">
              <span className="icon">❖</span> Dashboard
            </button>
            <button className="sidebar-item">
              <span className="icon">📅</span> Eventos
            </button>
            <button className="sidebar-item">
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
            <p className="dash-subtitle">Bienvenido, Admin</p>
          </header>

          {/* Tarjetas de estadísticas */}
          <div className="stats-grid">
            {stats.map(stat => (
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
            {/* Gráfico de barras Simulado */}
            <div className="chart-panel">
              <div className="panel-header">
                <h3>Entradas vendidas por semana</h3>
                <span className="panel-subtitle">Últimas 8 semanas</span>
              </div>
              <div className="bar-chart">
                {chartData.map((data, idx) => (
                  <div className="bar-col" key={idx}>
                    <span className="bar-val">{data.val}</span>
                    <div className="bar" style={{ height: data.height }}></div>
                    <span className="bar-label">{data.sem}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de eventos */}
            <div className="events-panel">
              <div className="panel-header">
                <h3>Estado de eventos</h3>
              </div>
              <ul className="events-list">
                {eventos.map(ev => (
                  <li key={ev.id}>
                    <div className="ev-info">
                      <span className={`ev-dot ${ev.status === 'Activo' ? 'green' : 'red'}`}></span>
                      <div>
                        <p className="ev-name">{ev.name}</p>
                        <p className="ev-tickets">{ev.tickets}</p>
                      </div>
                    </div>
                    <span className={`badge ${ev.status === 'Activo' ? 'badge-active' : 'badge-soon'}`}>
                      {ev.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Compras recientes */}
          <div className="recent-panel">
            <div className="panel-header">
              <h3>Compras recientes</h3>
              <span className="panel-subtitle">5 últimas transacciones</span>
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
                  {comprasRecientes.map((compra, index) => (
                    <tr key={index}>
                      <td className="tx-code">{compra.id}</td>
                      <td>{compra.evento}</td>
                      <td className="tx-seats">{compra.asientos}</td>
                      <td className="tx-total">{compra.total}</td>
                      <td className="tx-date">{compra.fecha}</td>
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