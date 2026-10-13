import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataContext } from './contextos';
import { comprasSeed, eventosSeed, usuariosSeed } from '../datos/seed';
import { MAX_ASIENTOS, calcularTotales, generarCodigoEntrada } from '../utilidades/precios';

const CLAVE_DATOS = 'luminaria_datos_v1';

/*
 * Lo que SÍ se guarda entre visitas: usuarios, compras y favoritos.
 * Los eventos no se guardan: se derivan de la semilla más las compras, así los asientos
 * ocupados nunca se desincronizan ni se duplican al recargar.
 *
 * La clave lleva sufijo _v1 a propósito: si algún día cambia la forma de los datos,
 * basta con subir la versión para que la copia vieja deje de usarse.
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
      favoritos: datos.favoritos && typeof datos.favoritos === 'object' ? datos.favoritos : {},
    };
  } catch {
    // localStorage puede no estar disponible (modo privado) o traer basura: se usa la semilla.
    return null;
  }
}

export function DataProvider({ children }) {
  const [datos, setDatos] = useState(
    () =>
      leerDatosGuardados() ?? {
        usuarios: usuariosSeed,
        compras: comprasSeed,
        favoritos: {},
      },
  );

  // Selección en curso: es transitoria y no se persiste, así que un refresco la pierde
  // y el checkout redirige a la cartelera en vez de quedarse sin asientos.
  const [seleccion, setSeleccion] = useState({ eventoId: null, asientos: [] });

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

  const favoritosDeUsuario = useCallback(
    (usuarioId) => (usuarioId ? (datos.favoritos[usuarioId] ?? []) : []),
    [datos.favoritos],
  );

  const alternarFavorito = useCallback((usuarioId, eventoId) => {
    if (!usuarioId) return;

    setDatos((previos) => {
      const actuales = previos.favoritos[usuarioId] ?? [];
      const siguientes = actuales.includes(eventoId)
        ? actuales.filter((id) => id !== eventoId)
        : [...actuales, eventoId];

      return { ...previos, favoritos: { ...previos.favoritos, [usuarioId]: siguientes } };
    });
  }, []);

  const agregarUsuario = useCallback((usuario) => {
    setDatos((previos) => ({ ...previos, usuarios: [...previos.usuarios, usuario] }));
  }, []);

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

  /**
   * Registra la compra. Antes de crearla vuelve a comprobar la disponibilidad, porque
   * entre que se eligen los asientos y se confirma la compra pueden haberse ocupado
   * (por ejemplo con la app abierta en dos pestañas).
   */
  const crearCompra = useCallback(
    ({ evento, usuarioId, asientos }) => {
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
      setSeleccion({ eventoId: null, asientos: [] });

      return { ok: true, compra };
    },
    [],
  );

  const valor = useMemo(
    () => ({
      usuarios: datos.usuarios,
      compras: datos.compras,
      eventos,
      obtenerEvento,
      comprasDeUsuario,
      obtenerCompra,
      favoritosDeUsuario,
      alternarFavorito,
      agregarUsuario,
      asientosSeleccionados,
      alternarAsiento,
      limpiarSeleccion,
      fijarAsientos,
      crearCompra,
    }),
    [
      datos.usuarios,
      datos.compras,
      eventos,
      obtenerEvento,
      comprasDeUsuario,
      obtenerCompra,
      favoritosDeUsuario,
      alternarFavorito,
      agregarUsuario,
      asientosSeleccionados,
      alternarAsiento,
      limpiarSeleccion,
      fijarAsientos,
      crearCompra,
    ],
  );

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>;
}
