import { comprasApi } from './compras.api';
import { comprasSimulado } from './compras.simulado';

// Un solo punto elige la implementación. VITE_COMPRAS_SIMULADAS=true mientras no exista
// el backend real de compras (Persona 3); la Fase 9 lo cambia a false.
const usarSimulado = import.meta.env.VITE_COMPRAS_SIMULADAS === 'true';

export const compras = usarSimulado ? comprasSimulado : comprasApi;
