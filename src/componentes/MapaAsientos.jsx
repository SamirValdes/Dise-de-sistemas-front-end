import { MAX_ASIENTOS, calcularTotales, esAsientoVip, formatearPrecio } from '../utilidades/precios';
import estilos from './MapaAsientos.module.css';

function codigoDe(asiento) {
  return `${asiento.fila}${asiento.numero}`;
}

/** Agrupa la lista plana de asientos de la API en filas ordenadas, con su zona. */
function agruparEnFilas(asientos) {
  const porFila = new Map();

  asientos.forEach((asiento) => {
    if (!porFila.has(asiento.fila)) {
      porFila.set(asiento.fila, { fila: asiento.fila, zona: asiento.zona, asientos: [] });
    }
    porFila.get(asiento.fila).asientos.push(asiento);
  });

  const filas = [...porFila.values()];
  filas.forEach((grupo) => grupo.asientos.sort((a, b) => a.numero - b.numero));
  filas.sort((a, b) => a.fila.localeCompare(b.fila));

  return filas;
}

const ETIQUETA_ESTADO = {
  Vendido: 'vendido',
  BloqueadoTemporal: 'bloqueado temporalmente',
};

function Fila({ fila, asientos, seleccionados, alPulsarAsiento }) {
  const mitad = Math.ceil(asientos.length / 2);
  const izquierda = asientos.slice(0, mitad);
  const derecha = asientos.slice(mitad);

  const claseAsiento = (asiento) => {
    if (asiento.estado !== 'Disponible') return `${estilos.asiento} ${estilos.ocupado}`;
    if (seleccionados.includes(codigoDe(asiento))) return `${estilos.asiento} ${estilos.elegido}`;
    if (asiento.zona === 'VIP') return `${estilos.asiento} ${estilos.vip}`;
    return estilos.asiento;
  };

  const renderizarLado = (lista) => (
    <div className={estilos.lado}>
      {lista.map((asiento) => {
        const codigo = codigoDe(asiento);
        const ocupado = asiento.estado !== 'Disponible';

        return (
          <button
            key={codigo}
            type="button"
            className={claseAsiento(asiento)}
            onClick={() => alPulsarAsiento(codigo)}
            disabled={ocupado}
            aria-pressed={seleccionados.includes(codigo)}
            title={
              ocupado
                ? `Asiento ${codigo} — ${ETIQUETA_ESTADO[asiento.estado] ?? 'ocupado'}`
                : `Asiento ${codigo}${asiento.zona === 'VIP' ? ' (VIP)' : ''}`
            }
          >
            {ocupado ? '×' : ''}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={estilos.fila}>
      <span className={estilos.etiquetaFila}>{fila}</span>
      {renderizarLado(izquierda)}
      <span className={estilos.pasillo} />
      {renderizarLado(derecha)}
      <span className={estilos.etiquetaFila}>{fila}</span>
    </div>
  );
}

/*
 * Mapa de butacas. Recibe solo los asientos reales del evento (de GET /api/eventos/{id},
 * que ya trae el mapa completo embebido) y los callbacks que usa — nunca el objeto evento
 * completo, para no acoplarse a campos que no le corresponden.
 *
 * El precio lo calcula calcularTotales(), la misma función que usa el checkout, para que
 * el total que se ve aquí y el de la pantalla de pago no puedan discrepar.
 */
function MapaAsientos({ asientos, precioBase, seleccionados, alAlternarAsiento, maxAsientos = MAX_ASIENTOS }) {
  const { total } = calcularTotales(seleccionados, precioBase);
  const lleno = seleccionados.length >= maxAsientos;

  const filas = agruparEnFilas(asientos);
  const filasVip = filas.filter((grupo) => grupo.zona === 'VIP');
  const filasGenerales = filas.filter((grupo) => grupo.zona !== 'VIP');

  return (
    <div className={estilos.mapa}>
      <div className={estilos.escenarioEnvoltura}>
        <div className={estilos.escenario}>Escenario</div>
      </div>

      <div className={estilos.seccion}>
        <p className={estilos.tituloSeccion}>— Zona VIP —</p>
        {filasVip.map((grupo) => (
          <Fila
            key={grupo.fila}
            fila={grupo.fila}
            asientos={grupo.asientos}
            seleccionados={seleccionados}
            alPulsarAsiento={alAlternarAsiento}
          />
        ))}
      </div>

      <div className={`${estilos.seccion} ${estilos.seccionGeneral}`}>
        <p className={estilos.tituloSeccionApagado}>— Zona General —</p>
        {filasGenerales.map((grupo) => (
          <Fila
            key={grupo.fila}
            fila={grupo.fila}
            asientos={grupo.asientos}
            seleccionados={seleccionados}
            alPulsarAsiento={alAlternarAsiento}
          />
        ))}
      </div>

      <div className={estilos.leyenda}>
        <span className={estilos.itemLeyenda}>
          <span className={`${estilos.muestra} ${estilos.muestraLibre}`} /> Disponible
        </span>
        <span className={estilos.itemLeyenda}>
          <span className={`${estilos.muestra} ${estilos.muestraVip}`} /> VIP disponible
        </span>
        <span className={estilos.itemLeyenda}>
          <span className={`${estilos.muestra} ${estilos.muestraElegido}`} /> Seleccionado
        </span>
        <span className={estilos.itemLeyenda}>
          <span className={`${estilos.muestra} ${estilos.muestraOcupado}`} /> Ocupado
        </span>
      </div>

      {lleno && (
        <p className={estilos.aviso}>
          Has alcanzado el máximo de {maxAsientos} asientos por compra.
        </p>
      )}

      {seleccionados.length > 0 && (
        <div className={estilos.resumen}>
          <h4 className={estilos.resumenTitulo}>Asientos seleccionados</h4>

          <div className={estilos.fichas}>
            {seleccionados.map((asiento) => (
              <span key={asiento} className={estilos.ficha}>
                {asiento}
                {esAsientoVip(asiento) ? ' VIP' : ''}
              </span>
            ))}
          </div>

          <div className={estilos.resumenTotal}>
            <span className={estilos.resumenCantidad}>
              {seleccionados.length} {seleccionados.length === 1 ? 'entrada' : 'entradas'}
            </span>
            <span className={estilos.resumenPrecio}>{formatearPrecio(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapaAsientos;
