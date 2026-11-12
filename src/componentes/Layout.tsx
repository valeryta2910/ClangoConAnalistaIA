// src/componentes/Layout.tsx
// Estructura de escritorio: barra lateral + cabecera + contenido con animación de entrada.
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { Avatar } from './Avatar';
import logo from '../assets/Logo-Clango.png';
import styles from './Layout.module.css';

const TITULOS: Record<string, string> = {
  '/viajes': 'Viajes disponibles',
  '/detalle': 'Detalles del viaje',
  '/chat': 'Chat con el conductor',
  '/seguimiento': 'Seguimiento en vivo',
  '/calificacion': 'Calificar conductor',
  '/dashboard': 'Panel del conductor',
  '/publicar': 'Publicar viaje',
  '/publicado': 'Viaje publicado',
  '/perfil': 'Mi perfil',
};

const GRUPOS = [
  {
    nombre: 'Viajero',
    enlaces: [
      { a: '/viajes', icono: '🧭', texto: 'Viajes disponibles' },
      { a: '/chat', icono: '💬', texto: 'Chat' },
      { a: '/seguimiento', icono: '📍', texto: 'Seguimiento' },
      { a: '/calificacion', icono: '⭐', texto: 'Calificar' },
    ],
  },
  {
    nombre: 'Conductor',
    enlaces: [
      { a: '/dashboard', icono: '📊', texto: 'Dashboard' },
      { a: '/publicar', icono: '🚗', texto: 'Publicar viaje' },
    ],
  },
  { nombre: 'Cuenta', enlaces: [{ a: '/perfil', icono: '👤', texto: 'Perfil' }] },
];

export const Layout = () => {
  const { usuario, cerrarSesion, toast } = useApp();
  const { pathname } = useLocation();
  const navegar = useNavigate();

  if (!usuario) return <Navigate to="/login" replace />;

  const salir = () => {
    cerrarSesion();
    toast('Sesión cerrada. ¡Hasta pronto!', 'info');
    navegar('/');
  };

  return (
    <div className={styles.app}>
      <aside className={styles.lateral}>
        <NavLink to="/" className={styles.marca}>
          <img src={logo} alt="CLANGo" />
          <span>CLAN<b>Go</b></span>
        </NavLink>

        <nav className={styles.nav}>
          {GRUPOS.map((g) => (
            <div key={g.nombre}>
              <p className={styles.grupo}>{g.nombre}</p>
              {g.enlaces.map((e) => (
                <NavLink key={e.a} to={e.a} title={e.texto} className={({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`}>
                  <span className={styles.icono}>{e.icono}</span>
                  <span className={styles.texto}>{e.texto}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.usuario}>
          <Avatar nombre={usuario.nombre} tam={40} />
          <div className={styles.datosUsuario}>
            <strong>{usuario.nombre}</strong>
            <small>{usuario.tipo === 'conductor' ? 'Conductor' : 'Viajero'}</small>
          </div>
          <button onClick={salir} className={styles.salir} title="Cerrar sesión" aria-label="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <div className={styles.principal}>
        <header className={styles.cabecera}>
          <h1>{TITULOS[pathname] ?? 'CLANGo'}</h1>
          <div className={styles.acciones}>
            <span className={styles.chipUni}>🎓 {usuario.universidad}</span>
            <button className={styles.campana} onClick={() => toast('No tienes notificaciones nuevas', 'info')} aria-label="Notificaciones">
              🔔<i />
            </button>
          </div>
        </header>
        {/* key={pathname} reinicia la animación de entrada en cada cambio de pantalla */}
        <main key={pathname} className={styles.contenido}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
