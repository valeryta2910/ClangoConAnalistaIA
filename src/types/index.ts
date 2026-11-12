// src/types/index.ts
// Contratos de datos del proyecto CLANGo (qué campos y de qué tipo).

// Tarjeta de indicador del dashboard (la de la guía)
export interface MetricaProyecto {
  id: number;
  titulo: string; // Nombre del indicador o variable de tu proyecto
  valor: string; // Valor cuantitativo o cualitativo (ej: '88%', '120 ms')
  estado: 'Óptimo' | 'Alto' | 'Estable' | 'Crítico'; // Valores de estado estrictos
}

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Viaje {
  id: number;
  nombreConductor: string;
  foto: string;
  destino: string;
  disponible: boolean;
  precio: number;
  calificacion: number;
  cupos: number;
  vehiculo: string;
  salida: string;
}

export interface Usuario {
  tipo: 'viajero' | 'conductor';
  nombre: string;
  correo: string;
  universidad: string;
  identificacion?: string;
  codigoEstudiantil?: string;
  modeloVehiculo?: string;
  placa?: string;
}

export interface Mensaje {
  id: number;
  texto: string;
  esPropio: boolean;
  hora: string;
}

export interface NuevoViaje {
  origen: string;
  destino: string;
  origenCoord: Coordenada;
  destinoCoord: Coordenada;
  horaSalida: string;
  cupos: number;
  precio: number;
  soloMujeres: boolean;
}

export interface ViajeHistorial {
  id: number;
  ruta: string;
  costo: number;
}

export type TipoToast = 'exito' | 'error' | 'info';

export interface ToastItem {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}
