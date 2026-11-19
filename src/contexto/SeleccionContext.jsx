import { useCallback, useMemo, useState } from 'react';
import { SeleccionContext } from './contextos';
import { MAX_ASIENTOS } from '../utilidades/precios';

/**
 * Selección de asientos en curso para el checkout. Vive en su propio contexto, separada
 * de los datos de compras: es transitoria a propósito (no se persiste), así que un
 * refresco la pierde y el checkout redirige a la cartelera en vez de quedarse con una
 * selección que ya no se puede garantizar.
 */
export function SeleccionProvider({ children }) {
  const [seleccion, setSeleccion] = useState({ eventoId: null, asientos: [] });

  const asientosSeleccionados = useCallback(
    (eventoId) => (seleccion.eventoId === eventoId ? seleccion.asientos : []),
    [seleccion],
  );

  /** Devuelve false si se intentó pasar del tope de asientos, para avisar en la interfaz. */
  const alternarAsiento = useCallback(
    (eventoId, asiento) => {
      const actuales = seleccion.eventoId === eventoId ? seleccion.asientos : [];
      const yaEstaba = actuales.includes(asiento);

      if (!yaEstaba && actuales.length >= MAX_ASIENTOS) return false;

      setSeleccion({
        eventoId,
        asientos: yaEstaba ? actuales.filter((a) => a !== asiento) : [...actuales, asiento],
      });
      return true;
    },
    [seleccion],
  );

  const limpiarSeleccion = useCallback(() => {
    setSeleccion({ eventoId: null, asientos: [] });
  }, []);

  const fijarAsientos = useCallback((eventoId, asientos) => {
    setSeleccion({ eventoId, asientos });
  }, []);

  const valor = useMemo(
    () => ({ asientosSeleccionados, alternarAsiento, limpiarSeleccion, fijarAsientos }),
    [asientosSeleccionados, alternarAsiento, limpiarSeleccion, fijarAsientos],
  );

  return <SeleccionContext.Provider value={valor}>{children}</SeleccionContext.Provider>;
}
