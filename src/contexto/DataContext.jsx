import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataContext } from './contextos';
import { comprasSeed, eventosSeed, usuariosSeed } from '../datos/seed';
import { calcularTotales, generarCodigoEntrada } from '../utilidades/precios';

const CLAVE_DATOS = 'luminaria_datos_v2';

/*
 * Lo que queda de los datos simulados originales, una vez separados favoritos
 * (FavoritosContext) y la selección de asientos en curso (SeleccionContext, transitoria,
 * tampoco vivía en localStorage): usuarios y compras de ejemplo. Alimentan las métricas
 * del dashboard admin y, hasta que la Fase 7 lo reemplace por servicios/compras.simulado.js,
 * el checkout simulado.
 *
 * La clave subió a _v2 porque la forma cambió (ya no incluye favoritos): así una copia
 * vieja en el navegador no se mezcla con el nuevo formato.
 */
function leerDatosGuardados() {
  try {
    const bruto = localStorage.getItem(CLAVE_DATOS);
    if (!bruto) return null;

    const datos = JSON.parse(bruto);
    if (!datos || !Array.isArray(datos.usuarios)) return null;

    return {
      usuarios: datos.usuarios,
      compras: Array.isArray(datos.compras) ? datos.compras : comprasSeed,
    };
  } catch {
    // localStorage puede no estar disponible (modo privado) o traer basura: se usa la semilla.
    return null;
  }
}

export function DataProvider({ children }) {
  const [datos, setDatos] = useState(
    () => leerDatosGuardados() ?? { usuarios: usuariosSeed, compras: comprasSeed },
  );

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
    } catch {
      // Sin persistencia la app sigue funcionando mientras dure la pestaña.
    }
  }, [datos]);

  // Asientos ocupados = los de la semilla más los que se han comprado.
  const eventos = useMemo(
    () =>
      eventosSeed.map((evento) => {
        const comprados = datos.compras
          .filter((compra) => compra.eventoId === evento.id)
          .flatMap((compra) => compra.asientos);

        return {
          ...evento,
          asientosOcupados: [...new Set([...evento.asientosOcupados, ...comprados])],
        };
      }),
    [datos.compras],
  );

  const obtenerEvento = useCallback(
    (id) => eventos.find((evento) => evento.id === id) ?? null,
    [eventos],
  );

  const comprasDeUsuario = useCallback(
    (usuarioId) => datos.compras.filter((compra) => compra.usuarioId === usuarioId),
    [datos.compras],
  );

  const obtenerCompra = useCallback(
    (compraId) => datos.compras.find((compra) => compra.id === compraId) ?? null,
    [datos.compras],
  );

  /**
   * Registra la compra. Antes de crearla vuelve a comprobar la disponibilidad, porque
   * entre que se eligen los asientos y se confirma la compra pueden haberse ocupado
   * (por ejemplo con la app abierta en dos pestañas).
   */
  const crearCompra = useCallback(({ evento, usuarioId, asientos }) => {
    const yaOcupados = asientos.filter((asiento) => evento.asientosOcupados.includes(asiento));

    if (yaOcupados.length > 0) {
      return {
        ok: false,
        error: `Estos asientos ya no están disponibles: ${yaOcupados.join(', ')}. Elige otros, por favor.`,
      };
    }

    const compra = {
      id: `p${Date.now()}`,
      eventoId: evento.id,
      usuarioId,
      asientos,
      total: calcularTotales(asientos, evento.precio).total,
      compradaEn: new Date().toISOString(),
      codigoEntrada: generarCodigoEntrada(),
    };

    // El código se genera fuera del updater: en StrictMode los updaters se ejecutan
    // dos veces en desarrollo y ahí dentro cada llamada daría un código distinto.
    setDatos((previos) => ({ ...previos, compras: [...previos.compras, compra] }));

    return { ok: true, compra };
  }, []);

  const valor = useMemo(
    () => ({
      usuarios: datos.usuarios,
      compras: datos.compras,
      eventos,
      obtenerEvento,
      comprasDeUsuario,
      obtenerCompra,
      crearCompra,
    }),
    [datos.usuarios, datos.compras, eventos, obtenerEvento, comprasDeUsuario, obtenerCompra, crearCompra],
  );

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>;
}
