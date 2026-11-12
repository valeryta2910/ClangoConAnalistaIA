// src/componentes/Avatar.tsx
// Foto del usuario; si la imagen no carga (sin internet) muestra sus iniciales.
import { useState } from 'react';

interface AvatarProps {
  src?: string;
  nombre: string;
  tam?: number;
}

export const Avatar = ({ src, nombre, tam = 48 }: AvatarProps) => {
  const [falla, setFalla] = useState(false);
  const iniciales = nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  const base = { width: tam, height: tam, borderRadius: '50%', flexShrink: 0 } as const;

  if (!src || falla) {
    return (
      <div
        style={{ ...base, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: tam * 0.36, color: '#04120a', background: 'linear-gradient(135deg,#22c55e,#38bdf8)' }}
        aria-label={nombre}
      >
        {iniciales}
      </div>
    );
  }
  return <img src={src} alt={`Foto de ${nombre}`} onError={() => setFalla(true)} style={{ ...base, objectFit: 'cover', border: '2px solid rgba(255,255,255,.15)' }} />;
};
