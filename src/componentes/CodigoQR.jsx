import estilos from './CodigoQR.module.css';

const LADO_QR = 9;

/*
 * QR simulado: no hay generador real, así que se dibuja una cuadrícula determinista a
 * partir del código de la entrada. El mismo código da siempre el mismo dibujo, y las tres
 * esquinas se pintan como los marcadores de posición de un QR real.
 *
 * Antes vivía solo en confirmacion.jsx; ahora también lo usa el panel de usuario
 * (Mis Entradas), así que se extrajo a un componente compartido.
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
    <div className={estilos.marco}>
      <div className={estilos.qr} aria-hidden="true">
        {celdas.map((rellena, indice) => (
          <span
            key={indice}
            className={rellena ? `${estilos.celda} ${estilos.celdaLlena}` : estilos.celda}
          />
        ))}
      </div>
    </div>
  );
}

export default CodigoQR;
