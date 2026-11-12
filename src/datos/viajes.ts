// src/datos/viajes.ts
import type { Viaje } from '../types/index';
import { nombreDestinoDesdeTexto } from './pasto';

const PRECIOS = [1500, 2000, 2500, 3000];
const VEHICULOS = ['Renault Kwid', 'Chevrolet Spark', 'Kia Picanto', 'Mazda 2', 'Honda CB 190'];
const SALIDAS = ['06:30', '07:15', '12:10', '13:45', '17:30', '18:20'];

// Adapta un conductor (venga de la API o de los datos de respaldo) al dominio de CLANGo
export function construirViaje(id: number, nombre: string, foto: string, disponible: boolean, indice: number): Viaje {
  return {
    id,
    nombreConductor: nombre,
    foto,
    destino: nombreDestinoDesdeTexto(nombre + id),
    disponible,
    precio: PRECIOS[indice % PRECIOS.length],
    calificacion: 4 + ((id * 7) % 10) / 10,
    cupos: 1 + (id % 4),
    vehiculo: VEHICULOS[id % VEHICULOS.length],
    salida: SALIDAS[indice % SALIDAS.length],
  };
}

const RESPALDO: [number, string, number, boolean][] = [
  [1, 'Brayan Ordóñez', 12, true],
  [2, 'Valentina Rosero', 32, true],
  [3, 'Camilo Ortega', 15, false],
  [4, 'Daniela Benavides', 47, true],
  [5, 'Andrés Guerrero', 53, true],
  [6, 'Laura Muñoz', 25, false],
  [7, 'Santiago Delgado', 60, true],
  [8, 'Sofía Chamorro', 44, true],
];

// Se usa si la API no responde (sin internet, por ejemplo)
export const VIAJES_RESPALDO: Viaje[] = RESPALDO.map(([id, nombre, img, disp], i) =>
  construirViaje(id, nombre, `https://i.pravatar.cc/200?img=${img}`, disp, i),
);
