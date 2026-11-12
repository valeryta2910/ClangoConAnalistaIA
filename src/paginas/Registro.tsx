// src/paginas/Registro.tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../componentes/AuthLayout';
import { useApp } from '../contexto/AppContext';
import styles from './Auth.module.css';

type Tipo = 'viajero' | 'conductor';
const VACIO = { nombre: '', identificacion: '', codigoEstudiantil: '', correo: '', contrasena: '', modeloVehiculo: '', placa: '' };
type Campos = typeof VACIO;

function fuerzaClave(c: string): number {
  return [c.length >= 8, /[A-Z]/.test(c) && /[a-z]/.test(c), /\d/.test(c), /[^A-Za-z0-9]/.test(c)].filter(Boolean).length;
}
const COLORES = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'];

export default function Registro() {
  const { iniciarSesion, toast } = useApp();
  const navegar = useNavigate();
  const [tipo, setTipo] = useState<Tipo>('viajero');
  const [datos, setDatos] = useState<Campos>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof Campos, string>>>({});
  const [verClave, setVerClave] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof Campos, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const validar = (): Partial<Record<keyof Campos, string>> => {
    const e: Partial<Record<keyof Campos, string>> = {};
    if (datos.nombre.trim().length < 3) e.nombre = 'Escribe tu nombre completo.';
    if (!/^\d{6,12}$/.test(datos.identificacion)) e.identificacion = 'Entre 6 y 12 números.';
    if (datos.codigoEstudiantil.trim().length < 4) e.codigoEstudiantil = 'Código inválido.';
    if (!/^\S+@\S+\.\S+$/.test(datos.correo)) e.correo = 'Correo no válido.';
    if (datos.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres.';
    if (tipo === 'conductor') {
      if (datos.modeloVehiculo.trim().length < 2) e.modeloVehiculo = 'Indica el modelo.';
      if (!/^[A-Za-z]{3}\s?-?\d{2,3}[A-Za-z]?$/.test(datos.placa.trim())) e.placa = 'Placa no válida (ej. ABC123).';
    }
    return e;
  };

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) {
      toast('Revisa los campos marcados en rojo.', 'error');
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      iniciarSesion({
        tipo,
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        universidad: 'Universidad Mariana',
        identificacion: datos.identificacion,
        codigoEstudiantil: datos.codigoEstudiantil,
        ...(tipo === 'conductor' ? { modeloVehiculo: datos.modeloVehiculo, placa: datos.placa.toUpperCase() } : {}),
      });
      toast(`¡Registro exitoso, ${datos.nombre.trim().split(' ')[0]}!`, 'exito');
      navegar(tipo === 'conductor' ? '/dashboard' : '/viajes');
    }, 1000);
  };

  const campo = (id: keyof Campos, etiqueta: string, tipoInput = 'text', placeholder = '') => (
    <div className={`campo ${errores[id] ? 'error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} type={tipoInput} placeholder={placeholder} value={datos[id]} onChange={(e) => cambiar(id, e.target.value)} />
      {errores[id] && <span className="msg-error">{errores[id]}</span>}
    </div>
  );

  const fuerza = fuerzaClave(datos.contrasena);

  return (
    <AuthLayout>
      <h1>Crea tu cuenta</h1>
      <p className={styles.sub}>Únete a la comunidad de viajes compartidos universitarios.</p>

      <div className={styles.pestanas} role="tablist">
        <i className={`${styles.indicador} ${tipo === 'conductor' ? styles.indicadorDer : ''}`} />
        <button type="button" role="tab" aria-selected={tipo === 'viajero'} className={`${styles.pestana} ${tipo === 'viajero' ? styles.pestanaActiva : ''}`} onClick={() => setTipo('viajero')}>🧍 Viajero</button>
        <button type="button" role="tab" aria-selected={tipo === 'conductor'} className={`${styles.pestana} ${tipo === 'conductor' ? styles.pestanaActiva : ''}`} onClick={() => setTipo('conductor')}>🚗 Conductor</button>
      </div>

      <form className={styles.form} onSubmit={enviar} noValidate>
        {campo('nombre', 'Nombre completo', 'text', 'Ej. Brayan Ordóñez')}
        <div className={styles.fila2}>
          {campo('identificacion', 'Identificación', 'text', '1085xxxxxx')}
          {campo('codigoEstudiantil', 'Código estudiantil', 'text', '2024xxxx')}
        </div>
        {campo('correo', 'Correo institucional', 'email', 'tu.nombre@umariana.edu.co')}

        <div className={`campo ${errores.contrasena ? 'error' : ''}`}>
          <label htmlFor="contrasena">Contraseña</label>
          <div className="input-icono">
            <input id="contrasena" type={verClave ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={datos.contrasena} onChange={(e) => cambiar('contrasena', e.target.value)} />
            <button type="button" onClick={() => setVerClave((v) => !v)} aria-label="Mostrar u ocultar contraseña">{verClave ? '🙈' : '👁️'}</button>
          </div>
          <div className={styles.fuerza}>
            {[0, 1, 2, 3].map((i) => <i key={i} style={{ background: i < fuerza ? COLORES[fuerza - 1] : undefined }} />)}
          </div>
          {errores.contrasena && <span className="msg-error">{errores.contrasena}</span>}
        </div>

        <div className={`${styles.extra} ${tipo === 'conductor' ? styles.extraAbierto : ''}`}>
          <div>
            <div className={styles.fila2}>
              {campo('modeloVehiculo', 'Modelo del vehículo', 'text', 'Renault Kwid')}
              {campo('placa', 'Placa', 'text', 'ABC123')}
            </div>
          </div>
        </div>

        <button className="btn btn-primario btn-grande btn-bloque" disabled={enviando}>
          {enviando ? <><span className="spinner" /> Creando cuenta…</> : 'Crear cuenta'}
        </button>
      </form>
      <p className={styles.pie}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </AuthLayout>
  );
}
