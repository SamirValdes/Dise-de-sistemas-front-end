import { useCallback, useEffect, useMemo, useState } from 'react';
import { FavoritosContext } from './contextos';

const CLAVE_FAVORITOS = 'luminaria_favoritos_v1';

function leerFavoritosGuardados() {
  try {
    const bruto = localStorage.getItem(CLAVE_FAVORITOS);
    if (!bruto) return {};

    const datos = JSON.parse(bruto);
    return datos && typeof datos === 'object' ? datos : {};
  } catch {
    // localStorage puede no estar disponible (modo privado) o traer basura: se empieza vacío.
    return {};
  }
}

/**
 * Favoritos por usuario. Quedan fuera de esta integración (ver GUIA_FRONTEND_FASES.md,
 * sección 1): no hay endpoint de favoritos todavía, así que siguen siendo 100% locales,
 * ahora en su propio contexto en vez de mezclados con los datos simulados de compras.
 */
export function FavoritosProvider({ children }) {
  const [favoritos, setFavoritos] = useState(leerFavoritosGuardados);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
    } catch {
      // Sin persistencia los favoritos duran lo que dure la pestaña.
    }
  }, [favoritos]);

  const favoritosDeUsuario = useCallback(
    (usuarioId) => (usuarioId ? (favoritos[usuarioId] ?? []) : []),
    [favoritos],
  );

  const alternarFavorito = useCallback((usuarioId, eventoId) => {
    if (!usuarioId) return;

    setFavoritos((previos) => {
      const actuales = previos[usuarioId] ?? [];
      const siguientes = actuales.includes(eventoId)
        ? actuales.filter((id) => id !== eventoId)
        : [...actuales, eventoId];

      return { ...previos, [usuarioId]: siguientes };
    });
  }, []);

  const valor = useMemo(
    () => ({ favoritosDeUsuario, alternarFavorito }),
    [favoritosDeUsuario, alternarFavorito],
  );

  return <FavoritosContext.Provider value={valor}>{children}</FavoritosContext.Provider>;
}
