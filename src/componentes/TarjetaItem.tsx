// src/componentes/TarjetaItem.tsx
import type { MetricaProyecto } from '../types/index';
import styles from './TarjetaItem.module.css';

const ICONOS = { Óptimo: '🟢', Alto: '🔵', Estable: '🟡', Crítico: '🔴' } as const;
const CLASES = { Óptimo: styles.optimo, Alto: styles.alto, Estable: styles.estable, Crítico: styles.critico } as const;

// El componente recibe las props tipadas mediante la interfaz MetricaProyecto
export const TarjetaItem = ({ titulo, valor, estado }: MetricaProyecto) => {
  return (
    <div className={styles.cardContainer}>
      <span className={styles.cardTitle}>{titulo}</span>
      <h3 className={styles.cardValue}>{valor}</h3>
      <span className={`${styles.cardBadge} ${CLASES[estado]}`}>
        {ICONOS[estado]} {estado}
      </span>
    </div>
  );
};
