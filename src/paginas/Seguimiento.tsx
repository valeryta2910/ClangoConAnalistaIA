// src/paginas/Seguimiento.tsx — Conductor animado sobre el mapa con ETA en vivo
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useViajeActual } from '../hooks/useViajeActual';
import { Avatar } from '../componentes/Avatar';
import { Mapa } from '../componentes/Mapa';
import { ORIGEN, PUNTOS_PASTO, coordDe, distanciaKm, generarPuntosDeRuta, minutosEstimados } from '../datos/pasto';
import s from './Paginas.module.css';

const PASOS_TOTALES = 14;
const ETAPAS = ['Conductor en camino', 'Muy cerca de ti', 'Llegó al punto de encuentro'];

export default function Seguimiento() {
  const viaje = useViajeActual();
  const encuentro = PUNTOS_PASTO[ORIGEN];
  const inicio = coordDe(viaje.destino);
  const puntos = useMemo(() => generarPuntosDeRuta(inicio, encuentro, PASOS_TOTALES), [inicio, encuentro]);
  const minBase = minutosEstimados(distanciaKm(inicio, encuentro));
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    if (paso >= PASOS_TOTALES) return;
    const t = setTimeout(() => setPaso((p) => p + 1), 1000);
    return () => clearTimeout(t);
  }, [paso]);

  const llego = paso >= PASOS_TOTALES;
  const minutos = Math.max(1, Math.round(((PASOS_TOTALES - paso) / PASOS_TOTALES) * minBase));
  const etapa = llego ? 2 : paso > PASOS_TOTALES * 0.6 ? 1 : 0;
  const progreso = Math.round((paso / PASOS_TOTALES) * 100);

  return (
    <div className={s.seguimiento}>
      <div className={s.mapaGrande}>
        <Mapa
          centro={inicio}
          ruta={[inicio, encuentro]}
          marcadores={[
            { id: 'enc', pos: encuentro, emoji: '🎓', color: '#22c55e', popup: 'Punto de encuentro' },
            { id: 'cond', pos: puntos[paso], emoji: '🚗', color: '#38bdf8', popup: viaje.nombreConductor },
          ]}
        />
      </div>

      <aside className={`panel ${s.panelSeg}`}>
        <div className={s.fila}>
          <Avatar src={viaje.foto} nombre={viaje.nombreConductor} tam={56} />
          <div>
            <h3>{viaje.nombreConductor}</h3>
            <p className="muted">{viaje.vehiculo} · Hacia {viaje.destino}</p>
          </div>
        </div>

        <div className={`${s.eta} ${llego ? s.etaLlego : ''}`}>
          <small>Tiempo estimado de llegada</small>
          <strong>{llego ? '¡Llegó!' : `${minutos} min`}</strong>
        </div>

        <div className={s.barra}><div style={{ width: `${progreso}%` }} /></div>
        <p className="muted" style={{ fontSize: 13, textAlign: 'right' }}>{progreso}% del trayecto</p>

        <ol className={s.etapas}>
          {ETAPAS.map((e, i) => (
            <li key={e} className={i < etapa ? s.hecha : i === etapa ? s.actual : ''}>
              <span>{i < etapa || (llego && i === etapa) ? '✓' : i + 1}</span> {e}
            </li>
          ))}
        </ol>

        <div className={s.botonesCol}>
          {llego ? (
            <Link to="/calificacion" className="btn btn-primario btn-bloque">⭐ Calificar al conductor</Link>
          ) : (
            <Link to="/chat" className="btn btn-primario btn-bloque">💬 Escribirle al conductor</Link>
          )}
          <button className="btn btn-secundario btn-bloque" onClick={() => setPaso(0)}>↻ Reiniciar simulación</button>
        </div>
      </aside>
    </div>
  );
}
