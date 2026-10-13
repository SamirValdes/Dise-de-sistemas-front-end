import { createContext } from 'react';

/*
 * Los contextos viven en su propio archivo para que los componentes que los proveen
 * puedan exportarse solos. Si el Provider y el contexto salieran del mismo módulo,
 * el plugin de React Refresh avisaría por mezclar componentes y valores.
 */

/** Sesión del usuario: quién ha iniciado sesión y las acciones de acceso. */
export const AuthContext = createContext(null);

/** Datos de la aplicación: eventos, usuarios, compras, favoritos y selección de asientos. */
export const DataContext = createContext(null);
