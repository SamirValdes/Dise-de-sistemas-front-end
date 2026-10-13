import { Link, Navigate, useParams } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useData } from '../../contexto/useData';
import { formatearFechaLarga } from '../../utilidades/fechas';
import { formatearPrecio } from '../../utilidades/precios';
import estilos from './confirmacion.module.css';

const LADO_QR = 9;

/*
 * QR simulado: no hay backend ni generador real, así que se dibuja una cuadrícula
 * determinista a partir del código de la entrada. El mismo código da siempre el mismo
 * dibujo, y las tres esquinas se pintan como los marcadores de posición de un QR real.
 */
function CodigoQR({ codigo }) {
  const semilla = codigo.split('').reduce((suma, letra) => suma + letra.charCodeAt(0), 0);

  const celdas = Array.from({ length: LADO_QR }, (_, fila) =>
    Array.from({ length: LADO_QR }, (_, columna) => {
      const enMarcador =
        (fila < 3 && columna < 3) || (fila < 3 && columna > 5) || (fila > 5 && columna < 3);
      if (enMarcador) return true;

      return (semilla * (fila + 1) * (columna + 1) * 31) % 11 > 4;
    }),
  ).flat();

  return (
    <div className={estilos.qr} aria-hidden="true">
      {celdas.map((rellena, indice) => (
        <span
          key={indice}
          className={rellena ? `${estilos.qrCelda} ${estilos.qrCeldaLlena}` : estilos.qrCelda}
        />
      ))}
    </div>
  );
}

/**
 * Confirmación de compra.
 *
 * La compra se busca por su id en la URL (`/confirmacion/:compraId`), así que el enlace
 * sigue funcionando al recargar, algo que el prototipo no hacía: allí la confirmación
 * dependía de `lastPurchase` en memoria y un F5 dejaba la pantalla en blanco.
 */
function Confirmacion() {
  const { compraId } = useParams();
  const { obtenerCompra, obtenerEvento } = useData();

  const compra = obtenerCompra(compraId);
  const evento = compra ? obtenerEvento(compra.eventoId) : null;

  if (!compra || !evento) {
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
                <p className={estilos.campoValor}>{evento.hora}</p>
              </div>
              <div>
                <p className={estilos.campoEtiqueta}>Sala</p>
                <p className={estilos.campoValor}>{evento.sala}</p>
              </div>
              <div>
                <p className={estilos.campoEtiqueta}>Asientos</p>
                <p className={`${estilos.campoValor} ${estilos.mono}`}>
                  {compra.asientos.join(', ')}
                </p>
              </div>
            </div>

            <div className={estilos.pieBoleto}>
              <div>
                <p className={estilos.campoEtiqueta}>Código de entrada</p>
                <p className={estilos.codigo}>{compra.codigoEntrada}</p>
                <p className={estilos.totalPagado}>
                  Total pagado: <span>{formatearPrecio(compra.total)}</span>
                </p>
              </div>
              <div className={estilos.qrMarco}>
                <CodigoQR codigo={compra.codigoEntrada} />
              </div>
            </div>
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
