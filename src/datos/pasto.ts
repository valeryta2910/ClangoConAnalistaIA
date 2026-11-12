// src/datos/pasto.ts
// Puntos de referencia reales (aprox.) de Pasto, Nariño y utilidades de ruta.
import type { Coordenada } from '../types/index';

export const ORIGEN = 'Universidad Mariana';

export const PUNTOS_PASTO: Record<string, Coordenada> = {
  'Universidad Mariana': { lat: 1.2137, lng: -77.281 },
  'Universidad de Nariño': { lat: 1.198, lng: -77.285 },
  'Universidad Cooperativa': { lat: 1.215, lng: -77.279 },
  'Universidad San Martín': { lat: 1.21, lng: -77.283 },
  'Universidad Cesmag': { lat: 1.216, lng: -77.277 },
  'Centro de Pasto': { lat: 1.2136, lng: -77.2811 },
  'Terminal de Pasto': { lat: 1.1995, lng: -77.2705 },
  'Avenida Panamericana': { lat: 1.225, lng: -77.265 },
  'Parque Bolívar': { lat: 1.2145, lng: -77.2795 },
  'Barrio Chapal': { lat: 1.2245, lng: -77.2765 },
};

export const LISTA_DESTINOS = Object.keys(PUNTOS_PASTO).filter((n) => n !== ORIGEN);

function hash(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

// Mismo texto => siempre el mismo destino de Pasto
export const nombreDestinoDesdeTexto = (texto: string): string =>
  LISTA_DESTINOS[hash(texto) % LISTA_DESTINOS.length];

export const coordDe = (nombre: string): Coordenada =>
  PUNTOS_PASTO[nombre] ?? PUNTOS_PASTO[nombreDestinoDesdeTexto(nombre)];

// Puntos intermedios con una leve curva para que no sea una línea recta
export function generarPuntosDeRuta(o: Coordenada, d: Coordenada, pasos = 14): Coordenada[] {
  const desvioBase = (o.lat + d.lng) % 1 > 0.5 ? 1 : -1;
  const puntos: Coordenada[] = [];
  for (let i = 0; i <= pasos; i++) {
    const p = i / pasos;
    puntos.push({
      lat: o.lat + (d.lat - o.lat) * p + Math.sin(p * Math.PI) * 0.0018 * desvioBase,
      lng: o.lng + (d.lng - o.lng) * p,
    });
  }
  return puntos;
}

export function distanciaKm(a: Coordenada, b: Coordenada): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const minutosEstimados = (km: number): number => Math.max(3, Math.round(km / 0.3));
