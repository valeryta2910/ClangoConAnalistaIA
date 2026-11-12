// src/contexto/AppContext.tsx
// Estado global: sesión del usuario, viaje elegido, viaje publicado y notificaciones.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NuevoViaje, TipoToast, ToastItem, Usuario, Viaje } from '../types/index';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { ContenedorToast } from '../componentes/Toast';

interface ValorApp {
  usuario: Usuario | null;
  iniciarSesion: (u: Usuario) => void;
  actualizarUsuario: (cambios: Partial<Usuario>) => void;
  cerrarSesion: () => void;
  viaje: Viaje | null;
  elegirViaje: (v: Viaje) => void;
  publicado: NuevoViaje | null;
  publicarViaje: (v: NuevoViaje) => void;
  toast: (mensaje: string, tipo?: TipoToast) => void;
}

const Contexto = createContext<ValorApp | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useSessionStorage<Usuario | null>('clango_usuario', null);
  const [viaje, setViaje] = useSessionStorage<Viaje | null>('clango_viaje_seleccionado', null);
  const [publicado, setPublicado] = useSessionStorage<NuevoViaje | null>('clango_viaje_publicado', null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((mensaje: string, tipo: TipoToast = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, mensaje, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3300);
  }, []);

  const valor = useMemo<ValorApp>(
    () => ({
      usuario,
      iniciarSesion: setUsuario,
      actualizarUsuario: (cambios) => setUsuario((u) => (u ? { ...u, ...cambios } : u)),
      cerrarSesion: () => {
        setUsuario(null);
        setViaje(null);
        setPublicado(null);
      },
      viaje,
      elegirViaje: setViaje,
      publicado,
      publicarViaje: setPublicado,
      toast,
    }),
    [usuario, viaje, publicado, toast, setUsuario, setViaje, setPublicado],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <ContenedorToast toasts={toasts} />
    </Contexto.Provider>
  );
}

export function useApp(): ValorApp {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return contexto;
}
