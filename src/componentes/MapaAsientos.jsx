import {
  FILAS_VIP,
  MAX_ASIENTOS,
  calcularTotales,
  esAsientoVip,
  formatearPrecio,
} from '../utilidades/precios';
import estilos from './MapaAsientos.module.css';

/** Filas D–J: zona general. Las VIP salen de `precios.js`, que es quien define la regla. */
const FILAS_GENERALES = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];

const COLUMNAS_VIP = 8;
const COLUMNAS_GENERALES = 12;

function Fila({ fila, columnas, evento, seleccionados, alPulsarAsiento }) {
  const mitad = columnas / 2;
  const izquierda = Array.from({ length: mitad }, (_, i) => `${fila}${i + 1}`);
  const derecha = Array.from({ length: mitad }, (_, i) => `${fila}${mitad + i + 1}`);

  const claseAsiento = (asiento) => {
    if (evento.asientosOcupados.includes(asiento)) return `${estilos.asiento} ${estilos.ocupado}`;
    if (seleccionados.includes(asiento)) return `${estilos.asiento} ${estilos.elegido}`;
    if (esAsientoVip(asiento)) return `${estilos.asiento} ${estilos.vip}`;
    return estilos.asiento;
  };

  const renderizarLado = (asientos) => (
    <div className={estilos.lado}>
      {asientos.map((asiento) => {
        const ocupado = evento.asientosOcupados.includes(asiento);

        return (
          <button
            key={asiento}
            type="button"
            className={claseAsiento(asiento)}
            onClick={() => alPulsarAsiento(asiento)}
            disabled={ocupado}
            aria-pressed={seleccionados.includes(asiento)}
            title={
              ocupado
                ? `Asiento ${asiento} — ocupado`
                : `Asiento ${asiento}${esAsientoVip(asiento) ? ' (VIP)' : ''}`
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
 * Mapa de butacas, puerto de `Teatro Figma/src/components/SeatMap.tsx`.
 * El precio lo calcula `calcularTotales()`, la misma función que usa el checkout,
 * para que el total que se ve aquí y el de la pantalla de pago no puedan discrepar.
 */
function MapaAsientos({ evento, seleccionados, alAlternarAsiento, maxAsientos = MAX_ASIENTOS }) {
  const { total } = calcularTotales(seleccionados, evento.precio);
  const lleno = seleccionados.length >= maxAsientos;

  return (
    <div className={estilos.mapa}>
      <div className={estilos.escenarioEnvoltura}>
        <div className={estilos.escenario}>Escenario</div>
      </div>

      <div className={estilos.seccion}>
        <p className={estilos.tituloSeccion}>— Zona VIP —</p>
        {FILAS_VIP.map((fila) => (
          <Fila
            key={fila}
            fila={fila}
            columnas={COLUMNAS_VIP}
            evento={evento}
            seleccionados={seleccionados}
            alPulsarAsiento={alAlternarAsiento}
          />
        ))}
      </div>

      <div className={`${estilos.seccion} ${estilos.seccionGeneral}`}>
        <p className={estilos.tituloSeccionApagado}>— Zona General —</p>
        {FILAS_GENERALES.map((fila) => (
          <Fila
            key={fila}
            fila={fila}
            columnas={COLUMNAS_GENERALES}
            evento={evento}
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
