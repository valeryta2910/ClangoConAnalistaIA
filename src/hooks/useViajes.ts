// src/hooks/useViajes.ts
// Consume la Rick and Morty API (simula conductores) con estados de carga y error.
import { useEffect, useState } from 'react';
import type { Viaje } from '../types/index';
import { construirViaje, VIAJES_RESPALDO } from '../datos/viajes';

interface PersonajeAPI {
  id: number;
  name: string;
  image: string;
  status: string;
}

export function useViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setCargando(true);
    setError(false);

    fetch('https://rickandmortyapi.com/api/character?page=1', { signal: control.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json() as Promise<{ results: PersonajeAPI[] }>;
      })
      .then((datos) => {
        const lista = Array.isArray(datos.results) ? datos.results : [];
        setViajes(lista.slice(0, 8).map((p, i) => construirViaje(p.id, p.name, p.image, p.status === 'Alive', i)));
      })
      .catch(() => {
        if (control.signal.aborted) return;
        setViajes(VIAJES_RESPALDO);
        setError(true);
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false);
      });

    return () => control.abort();
  }, [intento]);

  return { viajes, cargando, error, recargar: () => setIntento((n) => n + 1) };
}
