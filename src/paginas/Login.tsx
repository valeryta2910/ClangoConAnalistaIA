// src/paginas/Login.tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../componentes/AuthLayout';
import { useApp } from '../contexto/AppContext';
import styles from './Auth.module.css';

const nombreDesdeCorreo = (correo: string) =>
  correo.split('@')[0].split(/[._-]/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join(' ') || 'Estudiante';

export default function Login() {
  const { iniciarSesion, toast } = useApp();
  const navegar = useNavigate();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrar = (tipo: 'viajero' | 'conductor', nombre: string, mail: string) => {
    setEnviando(true);
    setTimeout(() => {
      iniciarSesion({
        tipo, nombre, correo: mail, universidad: 'Universidad Mariana',
        ...(tipo === 'conductor' ? { modeloVehiculo: 'Renault Kwid', placa: 'PNK 482' } : {}),
      });
      toast(`¡Bienvenido, ${nombre.split(' ')[0]}!`, 'exito');
      navegar(tipo === 'conductor' ? '/dashboard' : '/viajes');
    }, 700);
  };

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(correo) || clave.length < 1) {
      setError('Ingresa un correo válido y tu contraseña.');
      return;
    }
    setError('');
    entrar('viajero', nombreDesdeCorreo(correo), correo);
  };

  return (
    <AuthLayout>
      <h1>Bienvenido de nuevo 👋</h1>
      <p className={styles.sub}>Inicia sesión para encontrar o publicar tu próximo viaje.</p>
      <form className={styles.form} onSubmit={enviar} noValidate>
        <div className={`campo ${error ? 'error' : ''}`}>
          <label htmlFor="correo">Correo institucional</label>
          <input id="correo" type="email" placeholder="tu.nombre@umariana.edu.co" value={correo} onChange={(e) => { setCorreo(e.target.value); setError(''); }} />
        </div>
        <div className={`campo ${error ? 'error' : ''}`}>
          <label htmlFor="clave">Contraseña</label>
          <div className="input-icono">
            <input id="clave" type={ver ? 'text' : 'password'} placeholder="Tu contraseña" value={clave} onChange={(e) => { setClave(e.target.value); setError(''); }} />
            <button type="button" onClick={() => setVer((v) => !v)} aria-label="Mostrar u ocultar contraseña">{ver ? '🙈' : '👁️'}</button>
          </div>
          {error && <span className="msg-error">{error}</span>}
        </div>
        <div className={styles.enlaceFila}>
          <label className={styles.recordar}><input type="checkbox" defaultChecked /> Recordarme</label>
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </div>
        <button className="btn btn-primario btn-grande btn-bloque" disabled={enviando}>
          {enviando ? <><span className="spinner" /> Ingresando…</> : 'Iniciar sesión'}
        </button>
        <button type="button" className="btn btn-secundario btn-bloque" disabled={enviando} onClick={() => entrar('conductor', 'Brayan Ordóñez', 'brayan.ordonez@umariana.edu.co')}>
          🚗 Probar como conductor (demo)
        </button>
      </form>
      <p className={styles.pie}>¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </AuthLayout>
  );
}
