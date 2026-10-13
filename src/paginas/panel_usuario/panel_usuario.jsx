import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../componentes/Navbar';
import { useAuth } from '../../contexto/useAuth';
import { useData } from '../../contexto/useData';
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
  const { comprasDeUsuario, favoritosDeUsuario, alternarFavorito, obtenerEvento, eventos } = useData();
  const navegar = useNavigate();
  const [pestana, setPestana] = useState('perfil');

  const misCompras = comprasDeUsuario(usuario.id);
  const idsFavoritos = favoritosDeUsuario(usuario.id);
  const misFavoritos = eventos.filter((evento) => idsFavoritos.includes(evento.id));

  const pestanas = [
    { id: 'perfil', etiqueta: 'Mi Perfil' },
    { id: 'entradas', etiqueta: 'Mis Entradas', cuenta: misCompras.length },
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
                Miembro desde {formatearMarcaTiempo(usuario.registradoEn)}
              </span>
            </div>
          </div>

          <div className={estilos.contadores}>
            <Contador valor={misCompras.length} etiqueta="Compras" />
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
              <Dato etiqueta="Fecha de registro" valor={formatearMarcaTiempo(usuario.registradoEn)} />
            </div>
          </section>
        )}

        {/* Mis Entradas */}
        {pestana === 'entradas' && (
          <div className={estilos.lista}>
            {misCompras.length === 0 ? (
              <EstadoVacio
                icono={<IconoEntrada />}
                titulo="Sin entradas aún"
                descripcion="Compra tus primeras entradas y aparecerán aquí."
                accion="Ver eventos"
                alPulsar={() => navegar('/')}
              />
            ) : (
              misCompras.map((compra) => {
                const evento = obtenerEvento(compra.eventoId);
                if (!evento) return null;

                return (
                  <article key={compra.id} className={estilos.entrada}>
                    <div className={estilos.miniatura}>
                      <span>{evento.categoria}</span>
                    </div>

                    <div className={estilos.entradaCuerpo}>
                      <span className={estilos.categoria}>{evento.categoria}</span>
                      <h3 className={estilos.entradaTitulo}>{evento.nombre}</h3>
                      <p className={estilos.entradaMeta}>
                        {formatearFechaLarga(evento.fecha)} — {evento.hora}
                      </p>
                      <p className={estilos.entradaMeta}>
                        Asientos: <span className={estilos.monoTexto}>{compra.asientos.join(', ')}</span>
                      </p>
                      <p className={estilos.entradaMeta}>
                        Código: <span className={estilos.codigo}>{compra.codigoEntrada}</span>
                      </p>
                    </div>

                    <div className={estilos.entradaImporte}>
                      <p className={estilos.importeTotal}>{formatearPrecio(compra.total)}</p>
                      <p className={estilos.importeFecha}>{formatearMarcaTiempo(compra.compradaEn)}</p>
                    </div>
                  </article>
                );
              })
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
                      <p className={estilos.favoritoPrecio}>{formatearPrecio(evento.precio)}</p>
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
