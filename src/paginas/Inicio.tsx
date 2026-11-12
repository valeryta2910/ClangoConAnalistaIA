// src/paginas/Inicio.tsx — Landing de escritorio
import { Link } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { useContador } from '../hooks/useContador';
import { Avatar } from '../componentes/Avatar';
import logo from '../assets/Logo-Clango.png';
import styles from './Inicio.module.css';

const PASOS = [
  ['1', '🔎', 'Busca tu ruta', 'Mira conductores universitarios cerca de tu ruta en el mapa.'],
  ['2', '🤝', 'Reserva y chatea', 'Solicita tu cupo y coordina el punto de encuentro.'],
  ['3', '📍', 'Viaja seguro', 'Sigue el trayecto en vivo y califica al terminar.'],
];

const Estadistica = ({ meta, sufijo, etiqueta }: { meta: number; sufijo: string; etiqueta: string }) => {
  const valor = useContador(meta);
  return (
    <div className={styles.stat}>
      <strong>{valor.toLocaleString('es-CO')}{sufijo}</strong>
      <span>{etiqueta}</span>
    </div>
  );
};

export default function Inicio() {
  const { usuario } = useApp();

  return (
    <div className={styles.pagina}>
      <header className={styles.barra}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="CLANGo" /> <span>CLAN<b>Go</b></span>
        </Link>
        <nav>
          <a href="#como">Cómo funciona</a>
          <a href="#numeros">Comunidad</a>
          {usuario ? (
            <Link to={usuario.tipo === 'conductor' ? '/dashboard' : '/viajes'} className="btn btn-primario">Ir a la app →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secundario">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-primario">Registrarse</Link>
            </>
          )}
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.textoHero}>
          <span className={styles.etiqueta}>🚗 Carpooling universitario · Pasto</span>
          <h1>Llega a clases <em>más barato</em>, más rápido y acompañado.</h1>
          <p>CLANGo conecta estudiantes que comparten ruta. Publica tu viaje o súmate al de otro universitario desde $1.500 COP.</p>
          <div className={styles.botones}>
            <Link to={usuario ? '/viajes' : '/registro'} className="btn btn-primario btn-grande">Empezar ahora</Link>
            <Link to={usuario ? '/publicar' : '/login'} className="btn btn-secundario btn-grande">Quiero ser conductor</Link>
          </div>
        </div>

        <div className={styles.escena} aria-hidden>
          <div className={`${styles.flota} ${styles.f1}`}>
            <Avatar src="https://i.pravatar.cc/100?img=32" nombre="Valentina Rosero" tam={48} />
            <div><strong>Valentina Rosero</strong><small>Hacia Centro · 4.9 ★</small></div>
            <b>$2.000</b>
          </div>
          <div className={styles.mapaFalso}>
            <svg viewBox="0 0 400 300" preserveAspectRatio="none">
              <path d="M30 250 C 110 210, 130 120, 220 130 S 340 60, 370 40" className={styles.rutaSvg} />
            </svg>
            <span className={styles.pinA}>🎓</span>
            <span className={styles.pinB}>🏁</span>
            <span className={styles.auto}>🚗</span>
          </div>
          <div className={`${styles.flota} ${styles.f2}`}>
            <span className={styles.puntoVivo} /> Tu conductor llega en <b>4 min</b>
          </div>
        </div>
      </section>

      <section id="numeros" className={styles.stats}>
        <Estadistica meta={2400} sufijo="+" etiqueta="Estudiantes registrados" />
        <Estadistica meta={380} sufijo="" etiqueta="Conductores verificados" />
        <Estadistica meta={12500} sufijo="" etiqueta="Viajes compartidos" />
        <Estadistica meta={70} sufijo="%" etiqueta="Ahorro promedio" />
      </section>

      <section id="como" className={styles.como}>
        <h2>Así de fácil funciona</h2>
        <div className={styles.pasos}>
          {PASOS.map(([n, icono, titulo, texto]) => (
            <article key={n} className="panel">
              <span className={styles.numero}>{n}</span>
              <div className={styles.iconoPaso}>{icono}</div>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.pie}>© 2026 CLANGo · Universidad Mariana · Interacción Hombre-Máquina</footer>
    </div>
  );
}
