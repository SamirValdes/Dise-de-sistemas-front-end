import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import MapaAsientos from '../../componentes/MapaAsientos';
import { useAuth } from '../../contexto/useAuth';
import { useData } from '../../contexto/useData';
import { formatearFechaLarga } from '../../utilidades/fechas';
import {
  MAX_ASIENTOS,
  calcularTotales,
  etiquetaEstado,
  formatearPrecio,
} from '../../utilidades/precios';
import estilos from './detalle_evento.module.css';

function FilaDato({ etiqueta, valor }) {
  return (
    <div className={estilos.filaDato}>
      <span className={estilos.filaEtiqueta}>{etiqueta}</span>
      <span className={estilos.filaValor}>{valor}</span>
    </div>
  );
}

/**
 * Detalle de un evento con la selección de asientos.
 *
 * El evento se resuelve desde la URL (`/evento/:id`), no desde un estado en memoria,
 * así que recargar la página o compartir el enlace funciona.
 */
function DetalleEvento() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();
  const { obtenerEvento, asientosSeleccionados, alternarAsiento, limpiarSeleccion, favoritosDeUsuario, alternarFavorito } = useData();
  const [aviso, setAviso] = useState('');

  const evento = obtenerEvento(id);

  // Un id inexistente en la URL devuelve a la cartelera en vez de dejar la pantalla en blanco.
  if (!evento) {
    return <Navigate to="/" replace />;
  }

  const seleccionados = asientosSeleccionados(evento.id);
  const esFavorito = usuario ? favoritosDeUsuario(usuario.id).includes(evento.id) : false;
  const { total } = calcularTotales(seleccionados, evento.precio);
  const enVenta = evento.estado === 'activo';

  const alPulsarAsiento = (asiento) => {
    const aceptado = alternarAsiento(evento.id, asiento);
    setAviso(aceptado ? '' : `Solo puedes elegir ${MAX_ASIENTOS} asientos por compra.`);
  };

  const continuar = () => {
    navegar(`/checkout/${evento.id}`);
  };

  return (
    <div className={estilos.pagina}>
      <Navbar />

      {/* Cabecera con la imagen del evento */}
      <div className={estilos.portada}>
        <div className={estilos.portadaFondo}>
          <span className={estilos.portadaCategoria}>{evento.categoria}</span>
        </div>
        <div className={estilos.portadaDegradado} />

        <Link to="/" className={estilos.volver}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Cartelera
        </Link>

        <div className={estilos.portadaAcciones}>
          <span className={estilos.etiquetaEstado}>{etiquetaEstado(evento.estado)}</span>
          {usuario && (
            <button
              type="button"
              className={estilos.btnFavorito}
              onClick={() => alternarFavorito(usuario.id, evento.id)}
              title={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={esFavorito ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>

        <div className={estilos.portadaTexto}>
          <h1 className={estilos.titulo}>{evento.nombre}</h1>
          <p className={estilos.subtitulo}>{evento.descripcion}</p>
        </div>
      </div>

      <div className={estilos.interior}>
        <div className={estilos.columnas}>
          {/* Columna de información */}
          <aside className={estilos.columnaInfo}>
            <section className={estilos.tarjeta}>
              <h2 className={estilos.tarjetaTitulo}>Información</h2>
              <FilaDato etiqueta="Fecha" valor={formatearFechaLarga(evento.fecha)} />
              <FilaDato etiqueta="Hora" valor={evento.hora} />
              <FilaDato etiqueta="Duración" valor={evento.duracion} />
              <FilaDato etiqueta="Sala" valor={evento.sala} />
              <FilaDato etiqueta="Categoría" valor={evento.categoria} />
              <FilaDato etiqueta="Fin de venta" valor={formatearFechaLarga(evento.finVenta)} />
            </section>

            <section className={estilos.tarjeta}>
              <h2 className={estilos.tarjetaTitulo}>Precios</h2>
              <div className={estilos.filaPrecio}>
                <span className={estilos.filaEtiqueta}>Zona General (D–J)</span>
                <span className={estilos.precioValor}>{formatearPrecio(evento.precio)}</span>
              </div>
              <div className={estilos.filaPrecio}>
                <span className={estilos.filaEtiqueta}>
                  Zona VIP (A–C)
                  <span className={estilos.recargo}>×1.5</span>
                </span>
                <span className={estilos.precioValor}>{formatearPrecio(evento.precio * 1.5)}</span>
              </div>
              <p className={estilos.notaPrecio}>
                Al confirmar la compra se añade un 5% de cargo por servicio.
              </p>
            </section>

            <section className={estilos.tarjeta}>
              <h2 className={estilos.tarjetaTitulo}>Sobre el espectáculo</h2>
              <p className={estilos.sinopsis}>{evento.descripcionLarga}</p>
            </section>
          </aside>

          {/* Columna de selección de asientos */}
          <div className={estilos.columnaAsientos}>
            <section className={estilos.tarjeta}>
              <div className={estilos.cabeceraAsientos}>
                <h2 className={estilos.tarjetaTitulo}>Selección de asientos</h2>
                {seleccionados.length > 0 && (
                  <button
                    type="button"
                    className={estilos.btnLimpiar}
                    onClick={() => {
                      limpiarSeleccion();
                      setAviso('');
                    }}
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {!usuario ? (
                <div className={estilos.invitacion}>
                  <span className={estilos.invitacionIcono}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <h3 className={estilos.invitacionTitulo}>Inicia sesión para elegir asientos</h3>
                  <p className={estilos.invitacionTexto}>
                    Necesitas una cuenta para comprar entradas y seleccionar tu lugar en la sala.
                  </p>
                  <div className={estilos.invitacionBotones}>
                    <Link to="/login" className={estilos.btnPrimario}>
                      Iniciar sesión
                    </Link>
                    <Link to="/registro" className={estilos.btnSecundario}>
                      Registrarse
                    </Link>
                  </div>
                </div>
              ) : !enVenta ? (
                <div className={estilos.invitacion}>
                  <h3 className={estilos.invitacionTitulo}>Venta no disponible</h3>
                  <p className={estilos.invitacionTexto}>
                    La venta de entradas todavía no está abierta para este evento.
                  </p>
                </div>
              ) : (
                <>
                  <MapaAsientos
                    evento={evento}
                    seleccionados={seleccionados}
                    alAlternarAsiento={alPulsarAsiento}
                  />

                  {aviso && <p className={estilos.aviso}>{aviso}</p>}

                  {seleccionados.length > 0 && (
                    <div className={estilos.pieAsientos}>
                      <div>
                        <p className={estilos.pieCantidad}>
                          {seleccionados.length}{' '}
                          {seleccionados.length === 1 ? 'entrada seleccionada' : 'entradas seleccionadas'}
                        </p>
                        <p className={estilos.pieTotal}>
                          Total: <span className={estilos.pieImporte}>{formatearPrecio(total)}</span>
                        </p>
                      </div>
                      <button type="button" className={estilos.btnComprar} onClick={continuar}>
                        Continuar con la compra
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleEvento;
