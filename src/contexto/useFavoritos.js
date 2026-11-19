import { useContext } from 'react';
import { FavoritosContext } from './contextos';

/** Acceso a los favoritos del usuario actual. */
export function useFavoritos() {
  const contexto = useContext(FavoritosContext);

  if (!contexto) {
    throw new Error('useFavoritos() solo se puede usar dentro de <FavoritosProvider>.');
  }

  return contexto;
}
