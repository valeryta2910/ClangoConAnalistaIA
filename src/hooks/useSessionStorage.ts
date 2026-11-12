// src/hooks/useSessionStorage.ts
// useState que además guarda su valor en sessionStorage (sobrevive a recargar la página).
import { useEffect, useState } from 'react';

export function useSessionStorage<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const guardado = sessionStorage.getItem(clave);
      return guardado ? (JSON.parse(guardado) as T) : inicial;
    } catch {
      return inicial;
    }
  });

  useEffect(() => {
    try {
      if (valor === null || valor === undefined) sessionStorage.removeItem(clave);
      else sessionStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      /* sessionStorage no disponible */
    }
  }, [clave, valor]);

  return [valor, setValor] as const;
}
