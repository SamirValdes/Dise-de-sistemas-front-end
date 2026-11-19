import { createContext } from 'react';

/*
 * Los contextos viven en su propio archivo para que los componentes que los proveen
 * puedan exportarse solos. Si el Provider y el contexto salieran del mismo módulo,
 * el plugin de React Refresh avisaría por mezclar componentes y valores.
 */

/** Sesión del usuario: quién ha iniciado sesión y las acciones de acceso. */
export const AuthContext = createContext(null);

/**
 * Datos simulados que todavía no vienen de ninguna API: usuarios y compras de ejemplo
 * (alimentan las métricas del dashboard y, hasta la Fase 7, el checkout simulado).
 * Favoritos y la selección de asientos en curso viven en sus propios contextos.
 */
export const DataContext = createContext(null);

/** Favoritos por usuario. Fuera de alcance de la integración: se queda 100% local. */
export const FavoritosContext = createContext(null);

/** Selección de asientos en curso para el checkout. Transitoria: no se persiste. */
export const SeleccionContext = createContext(null);
