import { useContext } from 'react';
import { SeleccionContext } from './contextos';

/** Acceso a la selección de asientos en curso. */
export function useSeleccion() {
  const contexto = useContext(SeleccionContext);

  if (!contexto) {
    throw new Error('useSeleccion() solo se puede usar dentro de <SeleccionProvider>.');
  }

  return contexto;
}
