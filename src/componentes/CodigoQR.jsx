import estilos from './CodigoQR.module.css';

const LADO_QR = 9;

/*
 * QR de una entrada. Si `imagenBase64` llega (el PNG real que genera el backend con
 * QRCoder, Compras/Builder/BoletoDigitalBuilder), se muestra esa imagen. Si no — compra
 * simulada, o una entrada sin QR — se dibuja una cuadrícula determinista a partir del
 * código como aproximación visual; el mismo código da siempre el mismo dibujo, y las tres
 * esquinas se pintan como los marcadores de posición de un QR real.
 */
function CodigoQR({ codigo, imagenBase64 }) {
  if (imagenBase64) {
    return (
      <div className={estilos.marco}>
        <img
          src={`data:image/png;base64,${imagenBase64}`}
          alt={`Código QR de la entrada ${codigo}`}
          className={estilos.qr}
        />
      </div>
    );
  }

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
