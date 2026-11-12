// src/paginas/Publicado.tsx — Confirmación con animación de celebración
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { Mapa } from '../componentes/Mapa';
import s from './Paginas.module.css';

const COLORES = ['#22c55e', '#38bdf8', '#facc15', '#f472b6', '#fb923c'];

export default function Publicado() {
  const { publicado } = useApp();
  // Confeti: posiciones aleatorias creadas una sola vez
  const [confeti] = useState(() =>
    Array.from({ length: 36 }, (_, i) => ({ id: i, x: Math.random() * 100, r: Math.random() * 360, d: 2 + Math.random() * 2.5, t: Math.random() * 0.8, c: COLORES[i % COLORES.length] })),
  );

  if (!publicado) return <Navigate to="/publicar" replace />;

  return (
    <div className={s.dosColumnas}>
      <div className={s.confeti} aria-hidden>
        {confeti.map((p) => (
          <i key={p.id} style={{ left: `${p.x}%`, background: p.c, animationDuration: `${p.d}s`, animationDelay: `${p.t}s`, transform: `rotate(${p.r}deg)` }} />
        ))}
      </div>

      <section className={`panel ${s.exito}`}>
        <svg viewBox="0 0 52 52" className={s.check}><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg>
        <h2>¡Viaje publicado!</h2>
        <p className="muted">Los viajeros ya pueden verlo y reservar un cupo contigo.</p>
        <div className={s.resumenViaje}>
          <h3>{publicado.origen} → {publicado.destino}</h3>
          <p>Hoy, {publicado.horaSalida} · {publicado.cupos} cupos · ${publicado.precio.toLocaleString('es-CO')} COP</p>
          {publicado.soloMujeres && <span className="chip activo">🚺 Solo mujeres</span>}
        </div>
        <div className={s.botonesCol}>
          <Link to="/dashboard" className="btn btn-primario btn-grande btn-bloque">Ir al dashboard</Link>
          <Link to="/publicar" className="btn btn-secundario btn-bloque">Publicar otro viaje</Link>
        </div>
      </section>

      <aside className={s.mapaSticky}>
        <Mapa
          centro={publicado.origenCoord}
          ruta={[publicado.origenCoord, publicado.destinoCoord]}
          marcadores={[
            { id: 'o', pos: publicado.origenCoord, emoji: '🎓', color: '#22c55e', popup: publicado.origen },
            { id: 'd', pos: publicado.destinoCoord, emoji: '🏁', color: '#ef4444', popup: publicado.destino },
          ]}
        />
      </aside>
    </div>
  );
}
