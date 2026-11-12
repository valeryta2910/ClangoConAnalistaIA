// src/componentes/AuthLayout.tsx
// Pantalla dividida para Registro / Login / Recuperar: panel de marca + formulario.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo-Clango.png';
import styles from '../paginas/Auth.module.css';

const BENEFICIOS = [
  ['🎓', 'Solo estudiantes verificados con correo institucional'],
  ['💸', 'Viajes desde $1.500 COP, hasta 70% más barato'],
  ['🛡️', 'Seguimiento en vivo y calificaciones de conductores'],
];

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className={styles.pantalla}>
    <section className={styles.marca}>
      <i className={styles.burbuja1} />
      <i className={styles.burbuja2} />
      <Link to="/" className={styles.logo}>
        <img src={logo} alt="CLANGo" />
        <span>CLAN<b>Go</b></span>
      </Link>
      <div className={styles.mensaje}>
        <h2>Comparte el camino a la universidad.</h2>
        <p>La comunidad de viajes compartidos hecha por y para universitarios de Pasto.</p>
        <ul>
          {BENEFICIOS.map(([i, t]) => (
            <li key={t}><span>{i}</span>{t}</li>
          ))}
        </ul>
      </div>
    </section>
    <section className={styles.formulario}>
      <div className={styles.caja}>{children}</div>
    </section>
  </div>
);
