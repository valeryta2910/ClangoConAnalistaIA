// src/paginas/Recuperar.tsx — Contraseña olvidada en 2 pasos (correo → código)
import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../componentes/AuthLayout';
import { useApp } from '../contexto/AppContext';
import styles from './Auth.module.css';

export default function Recuperar() {
  const { toast } = useApp();
  const navegar = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const enviarCorreo = (ev: FormEvent) => {
    ev.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(correo)) return setError('Escribe un correo válido.');
    setError('');
    setPaso(2);
    toast(`Enviamos un código a ${correo}`, 'info');
    setTimeout(() => refs.current[0]?.focus(), 100);
  };

  const escribir = (i: number, valor: string) => {
    const d = valor.replace(/\D/g, '').slice(-1);
    setDigitos((prev) => prev.map((x, k) => (k === i ? d : x)));
    setError('');
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const teclas = (i: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digitos[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const pegar = (e: ClipboardEvent) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!t) return;
    e.preventDefault();
    setDigitos(Array.from({ length: 6 }, (_, k) => t[k] ?? ''));
    refs.current[Math.min(t.length, 5)]?.focus();
  };

  const verificar = (ev: FormEvent) => {
    ev.preventDefault();
    if (digitos.some((d) => !d)) return setError('Ingresa los 6 dígitos del código.');
    toast('¡Contraseña restablecida! Ya puedes iniciar sesión.', 'exito');
    navegar('/login');
  };

  return (
    <AuthLayout>
      {paso === 1 ? (
        <form className={styles.form} onSubmit={enviarCorreo} noValidate key="paso1">
          <h1>¿Olvidaste tu contraseña? 🔑</h1>
          <p className={styles.sub}>Escribe tu correo institucional y te enviaremos un código de 6 dígitos.</p>
          <div className={`campo ${error ? 'error' : ''}`}>
            <label htmlFor="correo">Correo institucional</label>
            <input id="correo" type="email" placeholder="tu.nombre@umariana.edu.co" value={correo} onChange={(e) => { setCorreo(e.target.value); setError(''); }} />
            {error && <span className="msg-error">{error}</span>}
          </div>
          <button className="btn btn-primario btn-grande btn-bloque">Enviar código</button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={verificar} noValidate key="paso2">
          <h1>Revisa tu correo ✉️</h1>
          <p className={styles.sub}>Ingresa el código de 6 dígitos que enviamos a <strong>{correo}</strong>.</p>
          <div className={styles.codigo} onPaste={pegar}>
            {digitos.map((d, i) => (
              <div className="campo" key={i}>
                <input ref={(el) => { refs.current[i] = el; }} inputMode="numeric" value={d} aria-label={`Dígito ${i + 1}`} onChange={(e) => escribir(i, e.target.value)} onKeyDown={(e) => teclas(i, e)} />
              </div>
            ))}
          </div>
          {error && <span className="msg-error">{error}</span>}
          <div className={styles.demo}>Demo: escribe cualquier código de 6 dígitos, por ejemplo 123456.</div>
          <button className="btn btn-primario btn-grande btn-bloque">Verificar código</button>
          <button type="button" className="btn btn-secundario btn-bloque" onClick={() => setPaso(1)}>← Cambiar correo</button>
        </form>
      )}
      <p className={styles.pie}><Link to="/login">← Volver a iniciar sesión</Link></p>
    </AuthLayout>
  );
}
