// src/paginas/Publicar.tsx — Formulario controlado + mapa con pines arrastrables
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { Mapa } from '../componentes/Mapa';
import { ORIGEN, PUNTOS_PASTO, distanciaKm, minutosEstimados } from '../datos/pasto';
import type { Coordenada } from '../types/index';
import s from './Paginas.module.css';

interface Punto { nombre: string; coord: Coordenada }
const PERSONALIZADO = 'Punto en el mapa';

export default function Publicar() {
  const { publicarViaje, toast } = useApp();
  const navegar = useNavigate();
  const [origen, setOrigen] = useState<Punto>({ nombre: ORIGEN, coord: PUNTOS_PASTO[ORIGEN] });
  const [destino, setDestino] = useState<Punto>({ nombre: 'Centro de Pasto', coord: PUNTOS_PASTO['Centro de Pasto'] });
  const [moverOrigen, setMoverOrigen] = useState(false);
  const [hora, setHora] = useState('07:00');
  const [cupos, setCupos] = useState(3);
  const [precio, setPrecio] = useState(2000);
  const [soloMujeres, setSoloMujeres] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const km = distanciaKm(origen.coord, destino.coord);
  const min = minutosEstimados(km);

  const elegir = (poner: (p: Punto) => void) => (nombre: string) => {
    if (PUNTOS_PASTO[nombre]) poner({ nombre, coord: PUNTOS_PASTO[nombre] });
  };
  const clicMapa = (c: Coordenada) => {
    (moverOrigen ? setOrigen : setDestino)({ nombre: PERSONALIZADO, coord: c });
    setMoverOrigen((v) => !v);
  };

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (!hora || cupos < 1 || precio < 1500) return setError('Completa todos los campos. El precio mínimo es $1.500 COP.');
    if (km < 0.05) return setError('El origen y el destino no pueden ser el mismo lugar.');
    setError('');
    setEnviando(true);
    setTimeout(() => {
      publicarViaje({ origen: origen.nombre, destino: destino.nombre, origenCoord: origen.coord, destinoCoord: destino.coord, horaSalida: hora, cupos, precio, soloMujeres });
      toast('¡Viaje publicado con éxito!', 'exito');
      navegar('/publicado');
    }, 900);
  };

  const opciones = Object.keys(PUNTOS_PASTO);

  return (
    <div className={s.dosColumnas}>
      <form className={`panel ${s.formularioPublicar}`} onSubmit={enviar} noValidate>
        <h2>Nuevo viaje</h2>
        <p className="muted">Mueve los pines en el mapa o elige los lugares de la lista.</p>

        <div className={s.fila2}>
          <div className="campo">
            <label htmlFor="origen">🎓 Origen</label>
            <select id="origen" value={origen.nombre} onChange={(e) => elegir(setOrigen)(e.target.value)}>
              {opciones.map((o) => <option key={o}>{o}</option>)}
              {origen.nombre === PERSONALIZADO && <option>{PERSONALIZADO}</option>}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="destino">🏁 Destino</label>
            <select id="destino" value={destino.nombre} onChange={(e) => elegir(setDestino)(e.target.value)}>
              {opciones.map((o) => <option key={o}>{o}</option>)}
              {destino.nombre === PERSONALIZADO && <option>{PERSONALIZADO}</option>}
            </select>
          </div>
        </div>

        <div className={s.fila2}>
          <div className="campo">
            <label htmlFor="hora">🕒 Hora de salida</label>
            <input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
          <div className="campo">
            <label>👥 Cupos</label>
            <div className={s.contador}>
              <button type="button" onClick={() => setCupos((c) => Math.max(1, c - 1))} aria-label="Menos cupos">−</button>
              <strong>{cupos}</strong>
              <button type="button" onClick={() => setCupos((c) => Math.min(4, c + 1))} aria-label="Más cupos">+</button>
            </div>
          </div>
        </div>

        <div className="campo">
          <label htmlFor="precio">💵 Precio por persona: <b style={{ color: 'var(--verde)' }}>${precio.toLocaleString('es-CO')} COP</b></label>
          <input id="precio" type="range" min={1500} max={3000} step={500} value={precio} onChange={(e) => setPrecio(Number(e.target.value))} className={s.rango} />
          <div className={s.marcasRango}><span>$1.500</span><span>$2.000</span><span>$2.500</span><span>$3.000</span></div>
        </div>

        <label className={s.interruptor}>
          <input type="checkbox" checked={soloMujeres} onChange={(e) => setSoloMujeres(e.target.checked)} />
          <i /> <span>🚺 Viaje solo para mujeres</span>
        </label>

        <div className={s.resumen}>
          <div><small>Distancia</small><strong>{km.toFixed(1)} km</strong></div>
          <div><small>Duración</small><strong>{min} min</strong></div>
          <div><small>Ingreso máximo</small><strong>${(precio * cupos).toLocaleString('es-CO')}</strong></div>
        </div>

        {error && <p className="msg-error">{error}</p>}
        <button className="btn btn-primario btn-grande btn-bloque" disabled={enviando}>
          {enviando ? <><span className="spinner" /> Publicando…</> : 'Publicar viaje'}
        </button>
      </form>

      <aside className={s.mapaSticky}>
        <Mapa
          centro={origen.coord}
          ruta={[origen.coord, destino.coord]}
          alClicMapa={clicMapa}
          marcadores={[
            { id: 'o', pos: origen.coord, emoji: '🎓', color: '#22c55e', popup: 'Origen (arrástrame)', arrastrable: true, alMover: (c) => setOrigen({ nombre: PERSONALIZADO, coord: c }) },
            { id: 'd', pos: destino.coord, emoji: '🏁', color: '#ef4444', popup: 'Destino (arrástrame)', arrastrable: true, alMover: (c) => setDestino({ nombre: PERSONALIZADO, coord: c }) },
          ]}
        />
      </aside>
    </div>
  );
}
