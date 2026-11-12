// src/services/ia.ts — código del NAVEGADOR: no contiene ninguna clave
import type { MetricaProyecto } from '../types/index';

// Traduce los códigos HTTP a mensajes que entiende el usuario (exportada para reutilizarla)
export function mensajeSegunEstado(status: number): string {
  if (status === 404) {
    return 'No se encontró el backend. ¿Ejecutaste "vercel dev" en lugar de "npm run dev"?';
  }
  if (status === 400) return 'Los datos enviados no son válidos.';
  if (status === 429) return 'Hay muchas solicitudes. Espera un poco e intenta de nuevo.';
  return 'El servicio de IA no está disponible. Intenta más tarde.';
}

export async function analizarIndicadores(
  indicadores: MetricaProyecto[],
  signal?: AbortSignal,
): Promise<string> {
  let res: Response;
  try {
    // Llamamos a NUESTRO backend, nunca directamente al proveedor
    res = await fetch('/api/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indicadores }),
      signal, // permite cancelar la petición (por ejemplo, por tiempo máximo)
    });
  } catch {
    // Solo llega aquí si falla la red o si se canceló la solicitud
    throw new Error('No hay conexión o la respuesta tardó demasiado.');
  }

  // Recuerda: fetch NO lanza error con 4xx o 5xx; hay que revisar res.ok
  if (!res.ok) throw new Error(mensajeSegunEstado(res.status));

  const datos = await res.json();
  return datos.texto;
}
