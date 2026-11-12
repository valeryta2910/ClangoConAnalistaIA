// src/paginas/Viajes.tsx — Lista filtrable + mapa con los conductores
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { useViajes } from '../hooks/useViajes';
import { TarjetaViaje } from '../componentes/TarjetaViaje';
import { Mapa, type MarcadorMapa } from '../componentes/Mapa';
import { ORIGEN, PUNTOS_PASTO, coordDe } from '../datos/pasto';
import type { Viaje } from '../types/index';
import s from './Paginas.module.css';

const FILTROS = ['Todos', 'Disponibles ahora', 'Hasta $2.000'] as const;
type Filtro = (typeof FILTROS)[number];

export default function Viajes() {
  const { elegirViaje, toast } = useApp();
  const navegar = useNavigate();
  const { viajes, cargando, error, recargar } = useViajes();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('Todos');
  const [orden, setOrden] = useState<'recomendado' | 'precio' | 'calificacion'>('recomendado');
  const [resaltado, setResaltado] = useState<number | null>(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = viajes.filter(
      (v) =>
        (!q || v.nombreConductor.toLowerCase().includes(q) || v.destino.toLowerCase().includes(q)) &&
        (filtro === 'Todos' || (filtro === 'Disponibles ahora' ? v.disponible : v.precio <= 2000)),
    );
    if (orden === 'precio') lista.sort((a, b) => a.precio - b.precio);
    if (orden === 'calificacion') lista.sort((a, b) => b.calificacion - a.calificacion);
    return lista;
  }, [viajes, busqueda, filtro, orden]);

  const abrir = (v: Viaje) => {
    elegirViaje(v);
    navegar('/detalle');
  };

  const marcadores: MarcadorMapa[] = [
    { id: 'yo', pos: PUNTOS_PASTO[ORIGEN], emoji: '🎓', color: '#22c55e', popup: 'Tu ubicación (Universidad Mariana)' },
    ...visibles.map((v) => ({
      id: `v${v.id}`,
      pos: coordDe(v.destino),
      emoji: '🚗',
      color: v.id === resaltado ? '#facc15' : v.disponible ? '#22c55e' : '#64748b',
      popup: `${v.nombreConductor} · hacia ${v.destino} · $${v.precio.toLocaleString('es-CO')}`,
      alClic: () => abrir(v),
    })),
  ];

  return (
    <div className={s.dosColumnas}>
      <section className={s.columna}>
        <div className={s.encabezado}>
          <div>
            <h2>Conductores cerca de tu ruta</h2>
            <p className="muted">{cargando ? 'Buscando…' : `${visibles.length} viajes encontrados`}</p>
          </div>
        </div>

        <div className={s.herramientas}>
          <div className={s.buscador}>
            <span>🔍</span>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar conductor o destino…" aria-label="Buscar" />
            {busqueda && <button onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda">✕</button>}
          </div>
          <div className="campo">
            <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)} aria-label="Ordenar por">
              <option value="recomendado">Ordenar: Recomendado</option>
              <option value="precio">Precio: menor a mayor</option>
              <option value="calificacion">Mejor calificados</option>
            </select>
          </div>
        </div>

        <div className={s.filtros}>
          {FILTROS.map((f) => (
            <button key={f} className={`chip ${filtro === f ? 'activo' : ''}`} onClick={() => setFiltro(f)}>{f}</button>
          ))}
        </div>

        {error && (
          <div className="aviso">
            <span>No pudimos conectar con el servidor. Mostrando datos de ejemplo.</span>
            <button onClick={() => { recargar(); toast('Reintentando…', 'info'); }}>Reintentar</button>
          </div>
        )}

        <div className={`${s.lista} escalonado`}>
          {cargando && Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton" style={{ height: 96 }} />)}
          {!cargando && visibles.length === 0 && (
            <div className={s.vacio}>
              <span>🛣️</span>
              <p>No hay viajes con esos filtros.</p>
              <button className="btn btn-secundario" onClick={() => { setBusqueda(''); setFiltro('Todos'); }}>Limpiar filtros</button>
            </div>
          )}
          {!cargando &&
            visibles.map((v) => (
              <TarjetaViaje key={v.id} viaje={v} resaltada={v.id === resaltado} alClic={() => abrir(v)} alEntrar={() => setResaltado(v.id)} alSalir={() => setResaltado(null)} />
            ))}
        </div>
      </section>

      <aside className={s.mapaSticky}>
        <Mapa centro={PUNTOS_PASTO[ORIGEN]} marcadores={marcadores} zoom={13} alto="100%" />
      </aside>
    </div>
  );
}
