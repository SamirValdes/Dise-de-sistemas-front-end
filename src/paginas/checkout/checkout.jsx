import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useAuth } from '../../contexto/useAuth';
import { useData } from '../../contexto/useData';
import { formatearFechaLarga } from '../../utilidades/fechas';
import { calcularTotales, formatearPrecio } from '../../utilidades/precios';
import estilos from './checkout.module.css';

/**
 * Resumen y confirmación de la compra.
 *
 * La ruta lleva el id del evento (`/checkout/:id`) porque la selección de asientos es
 * transitoria: si se recarga la página se pierde, y sin el id no habría forma de saber
 * de qué evento era el resumen. Con los dos guardias de abajo, ese caso devuelve al
 * usuario a donde puede continuar en lugar de mostrarle un total de $0.00.
 */
function Checkout() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();
  const { obtenerEvento, asientosSeleccionados, crearCompra } = useData();
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const evento = obtenerEvento(id);

  if (!evento) {
    return <Navigate to="/" replace />;
  }

  const asientos = asientosSeleccionados(evento.id);

  if (asientos.length === 0) {
    return <Navigate to={`/evento/${evento.id}`} replace />;
  }

  const { vip, general, subtotal, cargoServicio, total } = calcularTotales(asientos, evento.precio);

  const confirmar = () => {
    setError('');
    setProcesando(true);

    const resultado = crearCompra({ evento, usuarioId: usuario.id, asientos });

    if (!resultado.ok) {
      setError(resultado.error);
      setProcesando(false);
      return;
    }

    navegar(`/confirmacion/${resultado.compra.id}`, { replace: true });
  };

  return (
    <div className={estilos.pagina}>
      <Navbar />

      <div className={estilos.interior}>
        <Link to={`/evento/${evento.id}`} className={estilos.volver}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a la selección
        </Link>

        <h1 className={estilos.titulo}>Resumen de tu compra</h1>

        {/* Evento y desglose */}
        <section className={estilos.tarjeta}>
          <div className={estilos.cabeceraEvento}>
            <div className={estilos.miniatura}>
              <span>{evento.categoria}</span>
            </div>
            <div>
              <h2 className={estilos.eventoTitulo}>{evento.nombre}</h2>
              <p className={estilos.eventoMeta}>
                {formatearFechaLarga(evento.fecha)} — {evento.hora}
              </p>
              <p className={estilos.eventoMeta}>{evento.sala}</p>
            </div>
          </div>

          <div className={estilos.cuerpo}>
            <h3 className={estilos.subtitulo}>Asientos</h3>

            <div className={estilos.listaAsientos}>
              {general.map((asiento) => (
                <div key={asiento} className={estilos.lineaAsiento}>
                  <div className={estilos.asientoInfo}>
                    <span className={estilos.asientoCodigo}>{asiento}</span>
                    <span className={estilos.asientoZona}>Zona General</span>
                  </div>
                  <span className={estilos.asientoPrecio}>{formatearPrecio(evento.precio)}</span>
                </div>
              ))}

              {vip.map((asiento) => (
                <div key={asiento} className={estilos.lineaAsiento}>
                  <div className={estilos.asientoInfo}>
                    <span className={estilos.asientoCodigo}>{asiento}</span>
                    <span className={estilos.asientoZona}>Zona VIP</span>
                    <span className={estilos.etiquetaVip}>VIP</span>
                  </div>
                  <span className={estilos.asientoPrecio}>
                    {formatearPrecio(evento.precio * 1.5)}
                  </span>
                </div>
              ))}
            </div>

            <div className={estilos.totales}>
              <div className={estilos.lineaTotal}>
                <span className={estilos.totalEtiqueta}>Subtotal</span>
                <span className={estilos.totalValor}>{formatearPrecio(subtotal)}</span>
              </div>
              <div className={estilos.lineaTotal}>
                <span className={estilos.totalEtiqueta}>Cargo por servicio (5%)</span>
                <span className={estilos.totalValor}>{formatearPrecio(cargoServicio)}</span>
              </div>
              <div className={estilos.lineaTotalFinal}>
                <span className={estilos.totalEtiquetaFuerte}>Total</span>
                <span className={estilos.totalFinal}>{formatearPrecio(total)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Datos del comprador */}
        <section className={estilos.tarjeta}>
          <h3 className={estilos.subtitulo}>Datos del comprador</h3>
          <div className={estilos.rejillaComprador}>
            <div>
              <p className={estilos.campoEtiqueta}>Nombre</p>
              <p className={estilos.campoValor}>{usuario.nombre}</p>
            </div>
            <div>
              <p className={estilos.campoEtiqueta}>Correo</p>
              <p className={estilos.campoValor}>{usuario.correo}</p>
            </div>
          </div>
        </section>

        {/* Aviso */}
        <div className={estilos.aviso}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>
            Al confirmar la compra recibirás tus entradas digitales. Las entradas son personales e
            intransferibles.
          </p>
        </div>

        {error && <p className={estilos.error}>{error}</p>}

        <button
          type="button"
          className={estilos.btnConfirmar}
          onClick={confirmar}
          disabled={procesando}
        >
          {procesando ? 'Procesando...' : `Confirmar compra — ${formatearPrecio(total)}`}
        </button>

        <p className={estilos.referencia}>
          {asientos.length} {asientos.length === 1 ? 'entrada' : 'entradas'} ·{' '}
          {vip.length > 0 && `${vip.length} VIP · `}
          asientos elegidos: <span className={estilos.mono}>{asientos.join(', ')}</span>
        </p>
      </div>
    </div>
  );
}

export default Checkout;
