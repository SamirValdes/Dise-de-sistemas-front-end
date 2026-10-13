import { useContext } from 'react';
import { DataContext } from './contextos';

/** Acceso a eventos, compras, favoritos y a la selección de asientos en curso. */
export function useData() {
  const contexto = useContext(DataContext);

  if (!contexto) {
    throw new Error('useData() solo se puede usar dentro de <DataProvider>.');
  }

  return contexto;
}
