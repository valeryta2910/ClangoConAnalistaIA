// src/paginas/Dashboard.tsx — Panel del conductor (usa TarjetaItem de la guía)
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { TarjetaItem } from '../componentes/TarjetaItem';
import { PanelIA } from '../componentes/PanelIA';
import type { MetricaProyecto, ViajeHistorial } from '../types/index';
import s from './Paginas.module.css';

interface ProductoAPI { id: number; title: string; price: number }

const RESPALDO: ViajeHistorial[] = [
  { id: 1, ruta: 'Universidad Mariana → Centro de Pasto', costo: 2000 },
  { id: 2, ruta: 'Universidad Mariana → Terminal de Pasto', costo: 2500 },
  { id: 3, ruta: 'Universidad Mariana → Barrio Chapal', costo: 1500 },
  { id: 4, ruta: 'Universidad Mariana → Parque Bolívar', costo: 1500 },
  { id: 5, ruta: 'Universidad Mariana → Universidad de Nariño', costo: 3000 },
];
const SEMANA = [['L', 4], ['M', 6], ['X', 3], ['J', 8], ['V', 7], ['S', 2], ['D', 5]] as const;

export default function Dashboard() {
  const { usuario } = useApp();
  const [historial, setHistorial] = useState<ViajeHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [dia, setDia] = useState<number>(3);

  useEffect(() => {
    const control = new AbortController();
    fetch('https://fakestoreapi.com/products?limit=5', { signal: control.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json() as Promise<ProductoAPI[]>;
      })
      .then((datos) =>
        setHistorial(
          datos.map((p) => ({
            id: p.id,
            ruta: `Universidad Mariana → ${p.title.split(' ').slice(0, 3).join(' ')}`,
            costo: Math.round(p.price) < 8 ? 1500 : Math.min(Math.round(p.price) * 200, 3000),
          })),
        ),
      )
      .catch(() => {
        if (control.signal.aborted) return;
        setHistorial(RESPALDO);
        setError(true);
      })
      .finally(() => !control.signal.aborted && setCargando(false));
    return () => control.abort();
  }, []);

  const ganancias = useMemo(() => historial.reduce((t, v) => t + v.costo, 0), [historial]);

  // Datos simulados con el tipo MetricaProyecto (igual que en la guía)
  const metricas: MetricaProyecto[] = [
    { id: 1, titulo: 'Viajes Completados', valor: '48', estado: 'Óptimo' },
    { id: 2, titulo: 'Calificación Promedio', valor: '4.9 ★', estado: 'Alto' },
    { id: 3, titulo: 'Ganancias Recientes', valor: `$${ganancias.toLocaleString('es-CO')}`, estado: 'Estable' },
    { id: 4, titulo: 'Tasa de Cancelación', valor: '2%', estado: 'Óptimo' },
  ];
  const maximo = Math.max(...SEMANA.map(([, n]) => n));

  return (
    <div className={s.pila}>
      <div className={`panel ${s.bienvenida}`}>
        <div>
          <h2>Hola, {(usuario?.nombre ?? 'conductor').split(' ')[0]} 👋</h2>
          <p className="muted">Así va tu actividad como conductor de CLANGo.</p>
        </div>
        <Link to="/publicar" className="btn btn-primario btn-grande">➕ Publicar viaje</Link>
      </div>

      <section className={`${s.metricas} escalonado`}>
        {metricas.map((m) => (
          <TarjetaItem key={m.id} id={m.id} titulo={m.titulo} valor={m.valor} estado={m.estado} />
        ))}
      </section>

      {/* Unidad 3 · Tema 2: análisis con IA de los indicadores actuales */}
      <PanelIA indicadores={metricas} deshabilitado={cargando} />

      <div className={s.dosPaneles}>
        <section className="panel">
          <h3>Viajes de esta semana</h3>
          <p className="muted" style={{ marginBottom: 18 }}>
            {SEMANA[dia][1]} viajes el {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'][dia]}
          </p>
          <div className={s.grafica}>
            {SEMANA.map(([d, n], i) => (
              <button key={d} className={`${s.columnaGrafica} ${i === dia ? s.columnaActiva : ''}`} onClick={() => setDia(i)} aria-label={`${d}: ${n} viajes`}>
                <em>{n}</em>
                <i style={{ height: `${(n / maximo) * 100}%`, animationDelay: `${i * 70}ms` }} />
                <span>{d}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3 style={{ marginBottom: 14 }}>Historial de viajes</h3>
          {error && <div className="aviso" style={{ marginBottom: 12 }}>No pudimos cargar tu historial real. Mostrando ejemplos.</div>}
          <div className={`${s.historial} escalonado`}>
            {cargando && Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton" style={{ height: 58 }} />)}
            {!cargando && historial.length === 0 && <p className="muted">Todavía no has hecho viajes.</p>}
            {!cargando &&
              historial.map((v) => (
                <div key={v.id} className={s.filaHistorial}>
                  <span className={s.icoHistorial}>🚗</span>
                  <div><strong>{v.ruta}</strong><small>Viaje completado</small></div>
                  <b>${v.costo.toLocaleString('es-CO')}</b>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
