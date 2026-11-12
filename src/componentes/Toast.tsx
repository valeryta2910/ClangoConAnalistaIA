// src/componentes/Toast.tsx
import type { ToastItem } from '../types/index';
import styles from './Toast.module.css';

const ICONOS = { exito: '✅', error: '⚠️', info: '💬' } as const;

export const ContenedorToast = ({ toasts }: { toasts: ToastItem[] }) => (
  <div className={styles.contenedor} aria-live="polite" role="status">
    {toasts.map((t) => (
      <div key={t.id} className={`${styles.toast} ${styles[t.tipo]}`}>
        <span>{ICONOS[t.tipo]}</span>
        {t.mensaje}
      </div>
    ))}
  </div>
);
