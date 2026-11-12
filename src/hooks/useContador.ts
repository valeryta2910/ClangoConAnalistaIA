// src/hooks/useContador.ts
// Número que sube animado de 0 hasta la meta.
import { useEffect, useState } from 'react';

export function useContador(meta: number, duracionMs = 1600): number {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    let frame = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - inicio) / duracionMs);
      setValor(Math.round(meta * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [meta, duracionMs]);

  return valor;
}
