// src/componentes/Mapa.tsx
// Mapa real (Leaflet + OpenStreetMap) con marcadores, ruta y pines arrastrables.
import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordenada } from '../types/index';
import { generarPuntosDeRuta } from '../datos/pasto';
import styles from './Mapa.module.css';

export interface MarcadorMapa {
  id: string;
  pos: Coordenada;
  emoji: string;
  color: string;
  popup?: string;
  arrastrable?: boolean;
  alMover?: (c: Coordenada) => void;
  alClic?: () => void;
}

interface MapaProps {
  centro: Coordenada;
  marcadores: MarcadorMapa[];
  ruta?: [Coordenada, Coordenada];
  zoom?: number;
  alto?: string;
  alClicMapa?: (c: Coordenada) => void;
}

const icono = (emoji: string, color: string) =>
  L.divIcon({
    className: 'clango-marker',
    html: `<span class="clango-pin" style="background:${color}">${emoji}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 36],
    popupAnchor: [0, -34],
  });

export const Mapa = ({ centro, marcadores, ruta, zoom = 13, alto = '100%', alClicMapa }: MapaProps) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const capa = useRef<L.LayerGroup | null>(null);
  const ultimaRuta = useRef('');
  // Siempre apuntan a la última versión de las props (para usarlas dentro de eventos de Leaflet)
  const marcadoresActuales = useRef(marcadores);
  const clicActual = useRef(alClicMapa);
  useEffect(() => {
    marcadoresActuales.current = marcadores;
    clicActual.current = alClicMapa;
  });

  // Crear el mapa una sola vez
  useEffect(() => {
    if (!contenedor.current) return;
    const m = L.map(contenedor.current, { zoomControl: false, attributionControl: false }).setView([centro.lat, centro.lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, subdomains: 'abc' }).addTo(m);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution('© OpenStreetMap').addTo(m);
    capa.current = L.layerGroup().addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => clicActual.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapa.current = m;
    const observador = new ResizeObserver(() => m.invalidateSize());
    observador.observe(contenedor.current);
    return () => {
      observador.disconnect();
      m.remove();
      mapa.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redibujar capas cuando cambian los marcadores o la ruta
  const clave = JSON.stringify([marcadores.map((m) => [m.id, m.pos, m.emoji, m.color, m.popup, m.arrastrable]), ruta]);
  useEffect(() => {
    const m = mapa.current;
    const g = capa.current;
    if (!m || !g) return;
    g.clearLayers();

    if (ruta) {
      const puntos = generarPuntosDeRuta(ruta[0], ruta[1], 14).map((p) => [p.lat, p.lng] as L.LatLngTuple);
      const linea = L.polyline(puntos, { color: '#22c55e', weight: 5, opacity: 0.9, lineCap: 'round', className: 'ruta-animada' }).addTo(g);
      const claveRuta = JSON.stringify(ruta);
      if (claveRuta !== ultimaRuta.current) {
        ultimaRuta.current = claveRuta;
        m.fitBounds(linea.getBounds(), { padding: [60, 60], animate: true });
      }
    }

    marcadores.forEach((mk) => {
      const pin = L.marker([mk.pos.lat, mk.pos.lng], { icon: icono(mk.emoji, mk.color), draggable: !!mk.arrastrable }).addTo(g);
      if (mk.popup) pin.bindPopup(mk.popup);
      pin.on('click', () => marcadoresActuales.current.find((x) => x.id === mk.id)?.alClic?.());
      pin.on('dragend', () => {
        const p = pin.getLatLng();
        marcadoresActuales.current.find((x) => x.id === mk.id)?.alMover?.({ lat: p.lat, lng: p.lng });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const irAMiUbicacion = () => {
    const m = mapa.current;
    if (!m) return;
    navigator.geolocation?.getCurrentPosition(
      (p) => m.flyTo([p.coords.latitude, p.coords.longitude], 15),
      () => m.flyTo([centro.lat, centro.lng], 14),
      { timeout: 4000 },
    );
  };

  return (
    <div className={styles.envoltorio} style={{ height: alto }}>
      <div ref={contenedor} className={styles.mapa} />
      <button type="button" className={styles.fab} onClick={irAMiUbicacion} aria-label="Centrar en mi ubicación">
        🎯
      </button>
    </div>
  );
};
