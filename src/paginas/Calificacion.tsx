// src/paginas/Calificacion.tsx — Estrellas con vista previa, etiquetas y comentario
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { useViajeActual } from '../hooks/useViajeActual';
import { Avatar } from '../componentes/Avatar';
import s from './Paginas.module.css';

const TEXTOS = ['Toca una estrella', 'Muy malo 😞', 'Regular 😕', 'Bien 🙂', 'Muy bueno 😄', '¡Excelente! 🤩'];
const ETIQUETAS = ['Puntual', 'Amable', 'Auto limpio', 'Conducción segura', 'Buena música', 'Ruta eficiente'];

export default function Calificacion() {
  const { toast } = useApp();
  const viaje = useViajeActual();
  const navegar = useNavigate();
  const [puntaje, setPuntaje] = useState(0);
  const [hover, setHover] = useState(0);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const mostrado = hover || puntaje;
  const alternar = (e: string) => setEtiquetas((l) => (l.includes(e) ? l.filter((x) => x !== e) : [...l, e]));

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (puntaje === 0) {
      setError(true);
      toast('Selecciona al menos una estrella antes de enviar.', 'error');
      return;
    }
    setEnviando(true);
    console.log('Calificación enviada:', { puntaje, etiquetas, comentario });
    setTimeout(() => {
      toast('¡Gracias por tu calificación!', 'exito');
      navegar('/viajes');
    }, 800);
  };

  return (
    <form className={`panel ${s.calificar}`} onSubmit={enviar}>
      <Avatar src={viaje.foto} nombre={viaje.nombreConductor} tam={96} />
      <h2>¿Cómo fue tu viaje con {viaje.nombreConductor.split(' ')[0]}?</h2>
      <p className="muted">Tu opinión ayuda a mantener segura a la comunidad.</p>

      <div className={`${s.estrellasGrandes} ${error ? s.sacudir : ''}`} role="radiogroup" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={puntaje === n}
            aria-label={`${n} estrellas`}
            className={n <= mostrado ? s.estrellaOn : ''}
            onMouseEnter={() => setHover(n)}
            onClick={() => { setPuntaje(n); setError(false); }}
          >
            ★
          </button>
        ))}
      </div>
      <p className={s.textoPuntaje}>{TEXTOS[mostrado]}</p>

      <div className={s.etiquetas}>
        {ETIQUETAS.map((e) => (
          <button type="button" key={e} className={`chip ${etiquetas.includes(e) ? 'activo' : ''}`} onClick={() => alternar(e)}>{e}</button>
        ))}
      </div>

      <div className="campo" style={{ width: '100%' }}>
        <label htmlFor="comentario">Comentario (opcional)</label>
        <textarea id="comentario" rows={3} maxLength={200} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Cuéntanos más sobre tu experiencia…" />
        <small className="muted" style={{ textAlign: 'right' }}>{comentario.length}/200</small>
      </div>

      <button className="btn btn-primario btn-grande btn-bloque" disabled={enviando}>
        {enviando ? <><span className="spinner" /> Enviando…</> : 'Enviar calificación'}
      </button>
    </form>
  );
}
