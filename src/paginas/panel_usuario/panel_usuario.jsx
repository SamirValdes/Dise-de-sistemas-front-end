import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import CodigoQR from '../../componentes/CodigoQR';
import { useAuth } from '../../contexto/useAuth';
import { useFavoritos } from '../../contexto/useFavoritos';
import { compras } from '../../servicios/compras';
import { eventos as serviciosEventos } from '../../servicios/eventos';
import { etiquetaRol, inicialDe } from '../../utilidades/roles';
import { formatearFechaCorta, formatearFechaLarga, formatearMarcaTiempo } from '../../utilidades/fechas';
import { formatearPrecio } from '../../utilidades/precios';
import estilos from './panel_usuario.module.css';

const IconoEntrada = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
  </svg>
);

const IconoCorazon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

function Dato({ etiqueta, valor }) {
  return (
    <div className={estilos.dato}>
      <p className={estilos.datoEtiqueta}>{etiqueta}</p>
      <p className={estilos.datoValor}>{valor}</p>
    </div>
  );
}

function Contador({ valor, etiqueta }) {
  return (
    <div className={estilos.contador}>
      <p className={estilos.contadorValor}>{valor}</p>
      <p className={estilos.contadorEtiqueta}>{etiqueta}</p>
    </div>
  );
}

function EstadoVacio({ icono, titulo, descripcion, accion, alPulsar }) {
  return (
    <div className={estilos.vacio}>
      <span className={estilos.vacioIcono}>{icono}</span>
      <h3 className={estilos.vacioTitulo}>{titulo}</h3>
      <p className={estilos.vacioTexto}>{descripcion}</p>
      <button type="button" className={estilos.vacioBoton} onClick={alPulsar}>
        {accion}
      </button>
    </div>
  );
}

/**
 * Panel de Usuario.
 *
 * Es el puerto de `Teatro Figma/src/pages/ProfilePage.tsx`, que era el único sitio
 * del prototipo donde un usuario normal veía su cuenta. No existía en este proyecto.
 */
function PanelUsuario() {
  const { usuario } = useAuth();
  const { favoritosDeUsuario, alternarFavorito } = useFavoritos();
  const navegar = useNavigate();
  const [pestana, setPestana] = useState('perfil');

  // Catálogo real de eventos: lo usa "Mis Favoritos" (ids reales desde la Fase 3).
  const [catalogoEventos, setCatalogoEventos] = useState([]);

  // Historial de compras (GET /api/compras/mias) y entradas propias, separadas en
  // próximas/pasadas por la API (GET /api/entradas/mias) — Fase 10.
  const [misComprasHistorial, setMisComprasHistorial] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(true);
  const [misEntradas, setMisEntradas] = useState({ proximas: [], pasadas: [] });
  const [cargandoEntradas, setCargandoEntradas] = useState(true);

  useEffect(() => {
    serviciosEventos
      .listar()
      .then(setCatalogoEventos)
      .catch(() => {
        // Si falla, "Mis Favoritos" se ve vacío en vez de romper el panel.
      });
  }, []);

  useEffect(() => {
    compras
      .misCompras()
      .then(setMisComprasHistorial)
      .catch(() => {
        // Idem: una lista vacía es mejor que una pantalla rota.
      })
      .finally(() => setCargandoCompras(false));
  }, []);

  useEffect(() => {
    compras
      .misEntradas()
      .then(setMisEntradas)
      .catch(() => {})
      .finally(() => setCargandoEntradas(false));
  }, []);

  const idsFavoritos = favoritosDeUsuario(usuario.id);
  const misFavoritos = catalogoEventos.filter((evento) => idsFavoritos.includes(evento.id));
  const totalEntradas = misEntradas.proximas.length + misEntradas.pasadas.length;

  const pestanas = [
    { id: 'perfil', etiqueta: 'Mi Perfil' },
    { id: 'compras', etiqueta: 'Mis Compras', cuenta: misComprasHistorial.length },
    { id: 'entradas', etiqueta: 'Mis Entradas', cuenta: totalEntradas },
    { id: 'favoritos', etiqueta: 'Mis Favoritos', cuenta: misFavoritos.length },
  ];

  return (
    <div className={estilos.pagina}>
      <Navbar />

      <div className={estilos.interior}>
        {/* Cabecera con los datos de la cuenta */}
        <header className={estilos.cabecera}>
          <div className={estilos.avatarGrande}>
            <span>{inicialDe(usuario)}</span>
          </div>

          <div className={estilos.identidad}>
            <h1 className={estilos.nombre}>{usuario.nombre}</h1>
            <p className={estilos.correo}>{usuario.correo}</p>
            <div className={estilos.meta}>
              <span className={estilos.insigniaRol}>{etiquetaRol(usuario)}</span>
              <span className={estilos.miembroDesde}>
                Miembro desde {formatearMarcaTiempo(usuario.fechaRegistro)}
              </span>
            </div>
          </div>

          <div className={estilos.contadores}>
            <Contador valor={misComprasHistorial.length} etiqueta="Compras" />
            <Contador valor={misFavoritos.length} etiqueta="Favoritos" />
          </div>
        </header>

        {/* Pestañas */}
        <div className={estilos.pestanas} role="tablist">
          {pestanas.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={pestana === item.id}
              onClick={() => setPestana(item.id)}
              className={`${estilos.pestana} ${pestana === item.id ? estilos.pestanaActiva : ''}`}
            >
              {item.etiqueta}
              {item.cuenta !== undefined && (
                <span
                  className={`${estilos.cuenta} ${pestana === item.id ? estilos.cuentaActiva : ''}`}
                >
                  {item.cuenta}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mi Perfil */}
        {pestana === 'perfil' && (
          <section className={estilos.tarjeta}>
            <h2 className={estilos.tarjetaTitulo}>Información personal</h2>
            <div className={estilos.rejillaDatos}>
              <Dato etiqueta="Nombre completo" valor={usuario.nombre} />
              <Dato etiqueta="Correo electrónico" valor={usuario.correo} />
              <Dato etiqueta="Rol" valor={etiquetaRol(usuario)} />
              <Dato etiqueta="Fecha de registro" valor={formatearMarcaTiempo(usuario.fechaRegistro)} />
            </div>
          </section>
        )}

        {/* Mis Compras: historial (GET /api/compras/mias) */}
        {pestana === 'compras' && (
          <div className={estilos.lista}>
            {cargandoCompras ? (
              <p className={estilos.datoEtiqueta}>Cargando…</p>
            ) : misComprasHistorial.length === 0 ? (
              <EstadoVacio
                icono={<IconoEntrada />}
                titulo="Sin compras aún"
                descripcion="Cuando compres entradas, aparecerán aquí."
                accion="Ver eventos"
                alPulsar={() => navegar('/')}
              />
            ) : (
              misComprasHistorial.map((compra) => (
                <article key={compra.id} className={estilos.entrada}>
                  <div className={estilos.miniatura}>
                    <span>{compra.estado}</span>
                  </div>

                  <div className={estilos.entradaCuerpo}>
                    <span className={estilos.categoria}>{compra.estado}</span>
                    <h3 className={estilos.entradaTitulo}>{compra.eventoNombre}</h3>
                    <p className={estilos.entradaMeta}>{formatearMarcaTiempo(compra.fecha)}</p>
                    <p className={estilos.entradaMeta}>
                      {compra.cantidadAsientos} {compra.cantidadAsientos === 1 ? 'entrada' : 'entradas'}
                    </p>
                  </div>

                  <div className={estilos.entradaImporte}>
                    <p className={estilos.importeTotal}>{formatearPrecio(compra.total)}</p>
                    <p className={estilos.importeFecha}>
                      Subtotal {formatearPrecio(compra.subtotal)} + {formatearPrecio(compra.cargoServicio)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Mis Entradas: próximas y pasadas (GET /api/entradas/mias), QR solo en próximas */}
        {pestana === 'entradas' && (
          <div className={estilos.lista}>
            {cargandoEntradas ? (
              <p className={estilos.datoEtiqueta}>Cargando…</p>
            ) : totalEntradas === 0 ? (
              <EstadoVacio
                icono={<IconoEntrada />}
                titulo="Sin entradas aún"
                descripcion="Compra tus primeras entradas y aparecerán aquí."
                accion="Ver eventos"
                alPulsar={() => navegar('/')}
              />
            ) : (
              <>
                <h3 className={estilos.tarjetaTitulo}>Próximas</h3>
                {misEntradas.proximas.length === 0 ? (
                  <p className={estilos.datoEtiqueta}>No tienes entradas para eventos próximos.</p>
                ) : (
                  misEntradas.proximas.map((entrada) => (
                    <article key={entrada.id} className={estilos.entrada}>
                      <div className={estilos.miniatura}>
                        <span>{entrada.zona}</span>
                      </div>

                      <div className={estilos.entradaCuerpo}>
                        <h3 className={estilos.entradaTitulo}>{entrada.eventoNombre}</h3>
                        <p className={estilos.entradaMeta}>
                          {formatearFechaLarga(entrada.eventoFecha)} — {entrada.eventoHora.slice(0, 5)}
                        </p>
                        <p className={estilos.entradaMeta}>
                          Asiento:{' '}
                          <span className={estilos.monoTexto}>
                            {entrada.fila}
                            {entrada.numero}
                          </span>{' '}
                          · {entrada.zona}
                        </p>
                        <p className={estilos.entradaMeta}>
                          Código: <span className={estilos.codigo}>{entrada.codigoUnico}</span>
                        </p>
                      </div>

                      <div className={estilos.entradaQr}>
                        <CodigoQR codigo={entrada.codigoUnico} imagenBase64={entrada.codigoQr} />
                      </div>
                    </article>
                  ))
                )}

                <h3 className={estilos.tarjetaTitulo}>Pasadas</h3>
                {misEntradas.pasadas.length === 0 ? (
                  <p className={estilos.datoEtiqueta}>Todavía no tienes entradas de eventos pasados.</p>
                ) : (
                  misEntradas.pasadas.map((entrada) => (
                    <article key={entrada.id} className={estilos.entrada}>
                      <div className={estilos.miniatura}>
                        <span>{entrada.zona}</span>
                      </div>

                      <div className={estilos.entradaCuerpo}>
                        <h3 className={estilos.entradaTitulo}>{entrada.eventoNombre}</h3>
                        <p className={estilos.entradaMeta}>
                          {formatearFechaLarga(entrada.eventoFecha)} — {entrada.eventoHora.slice(0, 5)}
                        </p>
                        <p className={estilos.entradaMeta}>
                          Asiento:{' '}
                          <span className={estilos.monoTexto}>
                            {entrada.fila}
                            {entrada.numero}
                          </span>{' '}
                          · {entrada.zona}
                        </p>
                        <p className={estilos.entradaMeta}>
                          Código: <span className={estilos.codigo}>{entrada.codigoUnico}</span>
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {/* Mis Favoritos */}
        {pestana === 'favoritos' && (
          <div>
            {misFavoritos.length === 0 ? (
              <EstadoVacio
                icono={<IconoCorazon />}
                titulo="Sin favoritos"
                descripcion="Guarda eventos para encontrarlos fácilmente después."
                accion="Explorar eventos"
                alPulsar={() => navegar('/')}
              />
            ) : (
              <div className={estilos.rejillaFavoritos}>
                {misFavoritos.map((evento) => (
                  <article key={evento.id} className={estilos.favorito}>
                    <div className={estilos.miniaturaFavorito}>
                      <span>{evento.categoria}</span>
                    </div>

                    <div className={estilos.favoritoCuerpo}>
                      <span className={estilos.categoria}>{evento.categoria}</span>
                      <h3 className={estilos.favoritoTitulo}>{evento.nombre}</h3>
                      <p className={estilos.favoritoFecha}>{formatearFechaCorta(evento.fecha)}</p>
                      <p className={estilos.favoritoPrecio}>{formatearPrecio(evento.precioBase)}</p>
                    </div>

                    <div className={estilos.favoritoAcciones}>
                      <Link
                        to={`/evento/${evento.id}`}
                        className={estilos.accionVer}
                        title="Ver evento"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>
                      <button
                        type="button"
                        className={estilos.accionQuitar}
                        onClick={() => alternarFavorito(usuario.id, evento.id)}
                        title="Quitar de favoritos"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PanelUsuario;
