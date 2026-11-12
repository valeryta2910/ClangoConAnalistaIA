// src/componentes/Estrellas.tsx
// Muestra una calificación (ej. 4.7) con estrellas parcialmente llenas.
export const Estrellas = ({ valor, tam = 16 }: { valor: number; tam?: number }) => (
  <span
    aria-label={`${valor.toFixed(1)} de 5`}
    style={{ position: 'relative', display: 'inline-block', fontSize: tam, letterSpacing: 2, lineHeight: 1 }}
  >
    <span style={{ color: 'rgba(255,255,255,.18)' }}>★★★★★</span>
    <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: `${(valor / 5) * 100}%`, color: 'var(--estrella)', whiteSpace: 'nowrap' }}>★★★★★</span>
  </span>
);
