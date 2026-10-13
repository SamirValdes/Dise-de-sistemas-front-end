import { useContext } from 'react';
import { AuthContext } from './contextos';

/** Acceso a la sesión: usuario actual, login, registro y cierre de sesión. */
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth() solo se puede usar dentro de <AuthProvider>.');
  }

  return contexto;
}
