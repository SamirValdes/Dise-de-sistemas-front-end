import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useAuth } from '../../contexto/useAuth';
import { useSeleccion } from '../../contexto/useSeleccion';
import { eventos as serviciosEventos } from '../../servicios/eventos';
import { compras } from '../../servicios/compras';
import { formatearFechaLarga } from '../../utilidades/fechas';
import { RECARGO_VIP, calcularTotales, formatearPrecio } from '../../utilidades/precios';
import estilos from './checkout.module.css';

const COMPRAS_SIMULADAS = import.meta.env.VITE_COMPRAS_SIMULADAS === 'true';

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, '0')}`;
}

/**
 * Resumen, bloqueo de 5 minutos y pago (simulado hasta la Fase 9) de la compra.
 *
 * La ruta lleva el id del evento (`/checkout/:id`) porque la selección de asientos es
 * transitoria: si se recarga la página se pierde, y sin el id no habría forma de saber
 * de qué evento era el resumen. Con los guardias de abajo, ese caso devuelve al usuario
 * a donde puede continuar en lugar de mostrarle un total de $0.00.
 */
function Checkout() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();
  const { asientosSeleccionados, limpiarSeleccion } = useSeleccion();

  const [evento, setEvento] = useState(null);
  const [cargandoEvento, setCargandoEvento] = useState(true);

  const [estado, setEstado] = useState('reservando'); // reservando | listo | reservaError | vencido | procesando | rechazado
  const [mensaje, setMensaje] = useState('');
  const [reservaId, setReservaId] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');

  const asientos = asientosSeleccionados(id);

  // Carga el evento real (el detalle de asientos/precio ya no sale del mock).
  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const datos = await serviciosEventos.obtener(id);
        if (!cancelado) setEvento(datos);
      } catch {
        if (!cancelado) setEvento(null);
      } finally {
        if (!cancelado) setCargandoEvento(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  const iniciarReserva = async () => {
    setEstado('reservando');
    setMensaje('');
    try {
      const { reservaId: id_, expiraEn } = await compras.reservarAsientos(evento.id, asientos);
      setReservaId(id_);
      setSegundosRestantes(Math.max(0, Math.round((expiraEn - Date.now()) / 1000)));
      setEstado('listo');
    } catch (err) {
      setMensaje(err.message);
      setEstado('reservaError');
    }
  };

  // Reserva los asientos en cuanto se conoce el evento (flujo 6: 409 si alguno ya no está libre).
  useEffect(() => {
    async function cargar() {
      if (evento && asientos.length > 0) {
        await iniciarReserva();
      }
    }

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento]);

  // Cuenta regresiva del bloqueo de 5 minutos (flujo 7: avisar y liberar la selección).
  useEffect(() => {
    if (estado !== 'listo') return undefined;

    const intervalo = setInterval(() => {
      setSegundosRestantes((previos) => {
        if (previos <= 1) {
          clearInterval(intervalo);
          setEstado('vencido');
          limpiarSeleccion();
          return 0;
        }
        return previos - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  if (cargandoEvento) {
    return (
      <div className={estilos.pagina}>
        <Navbar />
        <div className={estilos.interior}>
          <p className={estilos.subtitulo}>Cargando…</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return <Navigate to="/" replace />;
  }

  if (asientos.length === 0 && estado !== 'vencido' && estado !== 'comprado') {
    return <Navigate to={`/evento/${evento.id}`} replace />;
  }

  const { vip, general, subtotal, cargoServicio, total } = calcularTotales(asientos, evento.precioBase);

  const pagar = async (evt) => {
    evt.preventDefault();
    setEstado('procesando');
    setMensaje('');

    try {
      const { compra } = await compras.comprar(evento.id, asientos, {
        reservaId,
        precioBase: evento.precioBase,
        numeroTarjeta,
      });
      // "comprado" exime el guard de "selección vacía" de arriba: limpiarSeleccion() vacía
      // la selección en el mismo tick y, sin esto, ese guard redirigía a /evento/:id en vez
      // de dejar que navegar() llevara a la confirmación.
      setEstado('comprado');
      limpiarSeleccion();
      navegar(`/confirmacion/${compra.id}`, { replace: true });
    } catch (err) {
      if (err.status === 410) {
        setEstado('vencido');
        limpiarSeleccion();
      } else {
        // 402: pago rechazado (flujo 8). Los asientos ya se liberaron del lado del servicio.
        setMensaje(err.message);
        setEstado('rechazado');
      }
    }
  };

  const reintentar = () => {
    setNumeroTarjeta('');
    iniciarReserva();
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

        {estado === 'reservaError' && (
          <div className={estilos.error}>
            {mensaje}
            <br />
            <Link to={`/evento/${evento.id}`}>Volver al mapa de asientos</Link>
          </div>
        )}

        {estado === 'vencido' && (
          <div className={estilos.error}>
            Tu bloqueo de 5 minutos venció y se liberó tu selección.
            <br />
            <Link to={`/evento/${evento.id}`}>Elegir asientos de nuevo</Link>
          </div>
        )}

        {(estado === 'listo' || estado === 'procesando' || estado === 'rechazado' || estado === 'comprado') && (
          <>
            {/* Evento y desglose */}
            <section className={estilos.tarjeta}>
              <div className={estilos.cabeceraEvento}>
                <div className={estilos.miniatura}>
                  <span>{evento.categoria}</span>
                </div>
                <div>
                  <h2 className={estilos.eventoTitulo}>{evento.nombre}</h2>
                  <p className={estilos.eventoMeta}>
                    {formatearFechaLarga(evento.fecha)} — {evento.hora.slice(0, 5)}
                  </p>
                  <p className={estilos.eventoMeta}>{evento.sala}</p>
                </div>
              </div>

              <div className={estilos.cuerpo}>
                <div className={estilos.temporizador}>
                  Bloqueo de asientos: <strong>{formatearTiempo(segundosRestantes)}</strong>
                </div>

                <h3 className={estilos.subtitulo}>Asientos</h3>

                <div className={estilos.listaAsientos}>
                  {general.map((asiento) => (
                    <div key={asiento} className={estilos.lineaAsiento}>
                      <div className={estilos.asientoInfo}>
                        <span className={estilos.asientoCodigo}>{asiento}</span>
                        <span className={estilos.asientoZona}>Zona General</span>
                      </div>
                      <span className={estilos.asientoPrecio}>{formatearPrecio(evento.precioBase)}</span>
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
                        {formatearPrecio(evento.precioBase * RECARGO_VIP)}
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

            {/* Pago */}
            <section className={estilos.tarjeta}>
              <h3 className={estilos.subtitulo}>Pago</h3>
              <form className={estilos.formPago} onSubmit={pagar}>
                <label className={estilos.campoPago}>
                  Número de tarjeta
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={numeroTarjeta}
                    onChange={(evt) => setNumeroTarjeta(evt.target.value)}
                    disabled={estado === 'procesando'}
                  />
                </label>

                {COMPRAS_SIMULADAS && (
                  <p className={estilos.pistaPago}>
                    Pago simulado: cualquier número aprueba el pago, excepto{' '}
                    <span className={estilos.mono}>4000 0000 0000 0002</span>, que siempre se rechaza.
                  </p>
                )}

                {estado === 'rechazado' && (
                  <div className={estilos.error}>
                    {mensaje}
                    <br />
                    <button type="button" className={estilos.btnReintentar} onClick={reintentar}>
                      Reintentar
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className={estilos.btnConfirmar}
                  disabled={estado === 'procesando'}
                >
                  {estado === 'procesando' ? 'Procesando...' : `Confirmar compra — ${formatearPrecio(total)}`}
                </button>
              </form>
            </section>

            <p className={estilos.referencia}>
              {asientos.length} {asientos.length === 1 ? 'entrada' : 'entradas'} ·{' '}
              {vip.length > 0 && `${vip.length} VIP · `}
              asientos elegidos: <span className={estilos.mono}>{asientos.join(', ')}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;
