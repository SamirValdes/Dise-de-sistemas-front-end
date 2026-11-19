import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { compras } from '../../servicios/compras';
import { eventos as serviciosEventos } from '../../servicios/eventos';
import { formatearFechaLarga } from '../../utilidades/fechas';
import { formatearPrecio } from '../../utilidades/precios';
import estilos from './confirmacion.module.css';

/**
 * Confirmación de compra.
 *
 * checkout.jsx navega aquí pasando compra/evento/asientos por el estado de la ruta (no hay
 * un GET /api/compras/{id} individual, y el historial de /api/compras/mias no trae los
 * códigos de asiento ni el detalle por entrada). Si no hay estado — enlace directo o recarga
 * de la página — se intenta encontrar la compra en el historial igual, aunque sin asientos.
 */
function Confirmacion() {
  const { compraId } = useParams();
  const { state } = useLocation();

  const [compra, setCompra] = useState(state?.compra ?? null);
  const [evento, setEvento] = useState(state?.evento ?? null);
  const asientos = state?.asientos ?? null;
  const [cargando, setCargando] = useState(!state);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (state) return undefined;

    let cancelado = false;

    async function cargar() {
      try {
        const todas = await compras.misCompras();
        const encontrada = todas.find((c) => String(c.id) === compraId);

        if (!encontrada) {
          if (!cancelado) setError(true);
          return;
        }

        const datosEvento = await serviciosEventos.obtener(encontrada.eventoId);

        if (!cancelado) {
          setCompra(encontrada);
          setEvento(datosEvento);
        }
      } catch {
        if (!cancelado) setError(true);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compraId]);

  if (cargando) {
    return (
      <div className={estilos.pagina}>
        <Navbar />
        <div className={estilos.interior}>
          <p className={estilos.subtitulo}>Cargando…</p>
        </div>
      </div>
    );
  }

  if (error || !compra || !evento) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={estilos.pagina}>
      <Navbar />

      <div className={estilos.interior}>
        <header className={estilos.exito}>
          <span className={estilos.exitoIcono}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h1 className={estilos.titulo}>¡Compra exitosa!</h1>
          <p className={estilos.subtitulo}>Tus entradas han sido generadas correctamente</p>
        </header>

        {/* Entrada */}
        <article className={estilos.boleto}>
          <div className={estilos.boletoCabecera}>
            <span className={estilos.categoria}>{evento.categoria}</span>
            <h2 className={estilos.eventoTitulo}>{evento.nombre}</h2>
          </div>

          {/* Troquelado */}
          <div className={estilos.troquel}>
            <span className={estilos.muescaIzquierda} />
            <span className={estilos.muescaDerecha} />
          </div>

          <div className={estilos.boletoCuerpo}>
            <div className={estilos.rejillaDatos}>
              <div>
                <p className={estilos.campoEtiqueta}>Fecha</p>
                <p className={estilos.campoValor}>{formatearFechaLarga(evento.fecha)}</p>
              </div>
              <div>
                <p className={estilos.campoEtiqueta}>Hora</p>
                <p className={estilos.campoValor}>{evento.hora.slice(0, 5)}</p>
              </div>
              <div>
                <p className={estilos.campoEtiqueta}>Sala</p>
                <p className={estilos.campoValor}>{evento.sala}</p>
              </div>
              <div>
                <p className={estilos.campoEtiqueta}>Asientos</p>
                <p className={`${estilos.campoValor} ${estilos.mono}`}>
                  {asientos?.length ? asientos.join(', ') : `${compra.cantidadAsientos ?? ''} entrada(s)`}
                </p>
              </div>
            </div>

            <div className={estilos.pieBoleto}>
              <div>
                <p className={estilos.campoEtiqueta}>Estado</p>
                <p className={estilos.codigo}>{compra.estado}</p>
                <p className={estilos.totalPagado}>
                  Total pagado: <span>{formatearPrecio(compra.total)}</span>
                </p>
              </div>
            </div>

            <p className={estilos.campoEtiqueta}>
              El código y el QR de cada entrada están en «Mis entradas», dentro de tu panel.
            </p>
          </div>
        </article>

        <div className={estilos.acciones}>
          <Link to="/panel" className={estilos.btnSecundario}>
            Ver mis entradas
          </Link>
          <Link to="/" className={estilos.btnPrimario}>
            Ver más eventos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Confirmacion;
