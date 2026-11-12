// src/componentes/TarjetaViaje.tsx
import type { Viaje } from '../types/index';
import { Avatar } from './Avatar';
import { Estrellas } from './Estrellas';
import styles from './TarjetaViaje.module.css';

interface TarjetaViajeProps {
  viaje: Viaje;
  resaltada?: boolean;
  alClic?: () => void;
  alEntrar?: () => void;
  alSalir?: () => void;
}

export const TarjetaViaje = ({ viaje, resaltada, alClic, alEntrar, alSalir }: TarjetaViajeProps) => (
  <button
    type="button"
    className={`${styles.tarjeta} ${resaltada ? styles.resaltada : ''}`}
    onClick={alClic}
    onMouseEnter={alEntrar}
    onMouseLeave={alSalir}
  >
    <Avatar src={viaje.foto} nombre={viaje.nombreConductor} tam={56} />
    <div className={styles.info}>
      <h3>{viaje.nombreConductor}</h3>
      <p>
        Hacia <strong>{viaje.destino}</strong> · {viaje.salida}
      </p>
      <div className={styles.meta}>
        <Estrellas valor={viaje.calificacion} tam={13} />
        <span>{viaje.calificacion.toFixed(1)}</span>
        <span className={viaje.disponible ? styles.disponible : styles.pronto}>
          {viaje.disponible ? '● Disponible ahora' : '◔ Sale pronto'}
        </span>
      </div>
    </div>
    <div className={styles.precio}>
      ${viaje.precio.toLocaleString('es-CO')}
      <small>{viaje.cupos} cupos</small>
    </div>
  </button>
);
