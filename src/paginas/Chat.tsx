// src/paginas/Chat.tsx — Chat con indicador "escribiendo…" y respuestas simuladas
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useViajeActual } from '../hooks/useViajeActual';
import { Avatar } from '../componentes/Avatar';
import type { Mensaje } from '../types/index';
import s from './Paginas.module.css';

const RESPUESTAS = ['Listo, voy en camino 🚗', 'Claro, te aviso cuando esté llegando.', '¿Me confirmas el punto exacto?', 'Ya casi llego, gracias por la paciencia.', '¡Perfecto! Nos vemos ahí 👍'];
const RAPIDAS = ['¿Dónde estás?', 'Ya llegué al punto', 'Gracias 🙌', '¿Cuánto falta?'];
const hora = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

export default function Chat() {
  const viaje = useViajeActual();
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, texto: 'Hola, ya salí de la universidad. Llego en unos 5 minutos.', esPropio: false, hora: hora() },
    { id: 2, texto: 'Perfecto, te espero en la entrada principal.', esPropio: true, hora: hora() },
  ]);
  const [texto, setTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const temporizador = useRef(0);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, escribiendo]);
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const enviar = (contenido: string) => {
    const t = contenido.trim();
    if (!t) return;
    setMensajes((m) => [...m, { id: Date.now(), texto: t, esPropio: true, hora: hora() }]);
    setTexto('');
    setEscribiendo(true);
    clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => {
      setEscribiendo(false);
      setMensajes((m) => [...m, { id: Date.now() + 1, texto: RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)], esPropio: false, hora: hora() }]);
    }, 1500);
  };

  const alEnviar = (ev: FormEvent) => {
    ev.preventDefault();
    enviar(texto);
  };

  return (
    <div className={s.chatLayout}>
      <aside className={`panel ${s.chatLateral}`}>
        <Avatar src={viaje.foto} nombre={viaje.nombreConductor} tam={84} />
        <h3>{viaje.nombreConductor}</h3>
        <p className="muted">{viaje.vehiculo}</p>
        <div className={s.dato}><span>📍</span><small>Destino</small><strong>{viaje.destino}</strong></div>
        <div className={s.dato}><span>🕒</span><small>Salida</small><strong>Hoy, {viaje.salida}</strong></div>
        <Link to="/seguimiento" className="btn btn-secundario btn-bloque">📍 Ver en el mapa</Link>
      </aside>

      <section className={`panel ${s.chat}`}>
        <header className={s.chatCabecera}>
          <span className={s.puntoLinea} /> <strong>{viaje.nombreConductor}</strong>
          <small>{escribiendo ? 'escribiendo…' : 'en línea'}</small>
        </header>

        <div className={s.mensajes} ref={lista}>
          {mensajes.map((m) => (
            <div key={m.id} className={`${s.mensaje} ${m.esPropio ? s.propio : s.otro}`}>
              {m.texto}
              <small>{m.hora}</small>
            </div>
          ))}
          {escribiendo && (
            <div className={`${s.mensaje} ${s.otro} ${s.puntos}`}><i /><i /><i /></div>
          )}
        </div>

        <div className={s.rapidas}>
          {RAPIDAS.map((r) => <button key={r} className="chip" onClick={() => enviar(r)}>{r}</button>)}
        </div>

        <form className={s.enviarFila} onSubmit={alEnviar}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un mensaje…" aria-label="Mensaje" autoFocus />
          <button className="btn btn-primario" disabled={!texto.trim()}>Enviar ➤</button>
        </form>
      </section>
    </div>
  );
}
