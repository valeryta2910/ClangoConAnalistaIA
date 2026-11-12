// src/hooks/useViajeActual.ts
// Viaje elegido por el usuario; si entra directo a la pantalla usa uno de ejemplo.
import { useApp } from '../contexto/AppContext';
import { VIAJES_RESPALDO } from '../datos/viajes';

export function useViajeActual() {
  const { viaje } = useApp();
  return viaje ?? VIAJES_RESPALDO[1];
}
