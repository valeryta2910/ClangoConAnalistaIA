// src/paginas/Detalle.tsx — Detalle del viaje elegido + ruta en el mapa
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { useViajeActual } from '../hooks/useViajeActual';
import { Avatar } from '../componentes/Avatar';
import { Estrellas } from '../componentes/Estrellas';
import { Mapa } from '../componentes/Mapa';
import { ORIGEN, PUNTOS_PASTO, coordDe, distanciaKm, minutosEstimados } from '../datos/pasto';
import s from './Paginas.module.css';

export default function Detalle() {
  const { toast } = useApp();
  const viaje = useViajeActual();
  const navegar = useNavigate();
  const [estado, setEstado] = useState<'inicial' | 'solicitando' | 'solicitado'>('inicial');

  const origen = PUNTOS_PASTO[ORIGEN];
  const destino = coordDe(viaje.destino);
  const km = distanciaKm(origen, destino);
  const min = minutosEstimados(km);

  const solicitar = () => {
    setEstado('solicitando');
    setTimeout(() => {
      setEstado('solicitado');
      toast(`¡Cupo reservado con ${viaje.nombreConductor.split(' ')[0]}!`, 'exito');
    }, 1200);
  };

  const datos = [
    ['📍', 'Destino', viaje.destino],
    ['💵', 'Precio', `$${viaje.precio.toLocaleString('es-CO')} COP`],
    ['🕒', 'Salida', `Hoy, ${viaje.salida}`],
    ['⏱️', 'Duración', `${min} min · ${km.toFixed(1)} km`],
    ['👥', 'Cupos', `${viaje.cupos} disponibles`],
    ['🚘', 'Vehículo', viaje.vehiculo],
  ];

  return (
    <div className={s.dosColumnas}>
      <section className={`${s.columna} escalonado`}>
        <Link to="/viajes" className={s.volver}>← Volver a viajes</Link>

        <div className={`panel ${s.conductor}`}>
          <Avatar src={viaje.foto} nombre={viaje.nombreConductor} tam={88} />
          <div>
            <h2>{viaje.nombreConductor}</h2>
            <div className={s.fila}><Estrellas valor={viaje.calificacion} tam={18} /> <strong>{viaje.calificacion.toFixed(1)}</strong></div>
            <p className={s.verificado}>✅ Conductor verificado · {viaje.disponible ? 'Disponible ahora' : 'Sale en unos minutos'}</p>
          </div>
        </div>

        <div className={s.rejillaDatos}>
          {datos.map(([i, t, v]) => (
            <div key={t} className={s.dato}>
              <span>{i}</span>
              <small>{t}</small>
              <strong>{v}</strong>
            </div>
          ))}
        </div>

        {estado !== 'solicitado' ? (
          <button className="btn btn-primario btn-grande btn-bloque" onClick={solicitar} disabled={estado === 'solicitando'}>
            {estado === 'solicitando' ? <><span className="spinner" /> Reservando…</> : 'Solicitar viaje'}
          </button>
        ) : (
          <div className={`panel ${s.confirmado}`}>
            <p>🎉 <strong>¡Reserva confirmada!</strong> Ahora puedes coordinar con tu conductor.</p>
            <div className={s.botonesFila}>
              <button className="btn btn-primario" onClick={() => navegar('/seguimiento')}>📍 Seguir en vivo</button>
              <button className="btn btn-secundario" onClick={() => navegar('/chat')}>💬 Chatear</button>
            </div>
          </div>
        )}
      </section>

      <aside className={s.mapaSticky}>
        <Mapa
          centro={origen}
          ruta={[origen, destino]}
          marcadores={[
            { id: 'o', pos: origen, emoji: '🎓', color: '#22c55e', popup: 'Universidad Mariana (origen)' },
            { id: 'd', pos: destino, emoji: '🏁', color: '#ef4444', popup: viaje.destino },
          ]}
        />
      </aside>
    </div>
  );
}
