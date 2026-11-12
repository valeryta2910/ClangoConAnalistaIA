// src/paginas/Perfil.tsx — Perfil editable con preferencias
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexto/AppContext';
import { Avatar } from '../componentes/Avatar';
import fotoPerfil from '../assets/avatar-perfil.png';
import s from './Paginas.module.css';

export default function Perfil() {
  const { usuario, actualizarUsuario, cerrarSesion, toast } = useApp();
  const navegar = useNavigate();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [universidad, setUniversidad] = useState(usuario?.universidad ?? '');
  const [prefs, setPrefs] = useState({ notificaciones: true, ubicacion: true, correos: false });

  if (!usuario) return null;
  const esConductor = usuario.tipo === 'conductor';

  const guardar = (ev: FormEvent) => {
    ev.preventDefault();
    if (nombre.trim().length < 3) return toast('El nombre es muy corto.', 'error');
    actualizarUsuario({ nombre: nombre.trim(), universidad: universidad.trim() || usuario.universidad });
    setEditando(false);
    toast('Perfil actualizado', 'exito');
  };

  const alternar = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className={`${s.perfil} escalonado`}>
      <section className={`panel ${s.portada}`}>
        <div className={s.banner} />
        <div className={s.cabeceraPerfil}>
          <Avatar src={fotoPerfil} nombre={usuario.nombre} tam={112} />
          {editando ? (
            <form className={s.formEditar} onSubmit={guardar}>
              <div className="campo"><label htmlFor="nom">Nombre</label><input id="nom" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
              <div className="campo"><label htmlFor="uni">Universidad</label><input id="uni" value={universidad} onChange={(e) => setUniversidad(e.target.value)} /></div>
              <div className={s.botonesFila}>
                <button className="btn btn-primario">Guardar</button>
                <button type="button" className="btn btn-secundario" onClick={() => { setEditando(false); setNombre(usuario.nombre); setUniversidad(usuario.universidad); }}>Cancelar</button>
              </div>
            </form>
          ) : (
            <div className={s.infoPerfil}>
              <h2>{usuario.nombre}</h2>
              <p className="muted">{usuario.correo}</p>
              <div className={s.fila}>
                <span className="chip activo">{esConductor ? '🚗 Conductor' : '🧍 Viajero'}</span>
                <span className="chip">🎓 {usuario.universidad}</span>
                <span className="chip">✅ Verificado con correo institucional</span>
              </div>
            </div>
          )}
          {!editando && <button className="btn btn-secundario" onClick={() => setEditando(true)}>✏️ Editar perfil</button>}
        </div>
      </section>

      <section className={s.tresStats}>
        <div className="panel"><small className="muted">Calificación</small><strong>4.9 ★</strong></div>
        <div className="panel"><small className="muted">{esConductor ? 'Viajes publicados' : 'Viajes realizados'}</small><strong>48</strong></div>
        <div className="panel"><small className="muted">Ahorro estimado</small><strong>$96.000</strong></div>
      </section>

      <div className={s.dosPaneles}>
        {esConductor && (
          <section className="panel">
            <h3 style={{ marginBottom: 14 }}>🚘 Mi vehículo</h3>
            <div className={s.rejillaDatos}>
              <div className={s.dato}><small>Modelo</small><strong>{usuario.modeloVehiculo ?? 'Sin registrar'}</strong></div>
              <div className={s.dato}><small>Placa</small><strong>{usuario.placa ?? 'Sin registrar'}</strong></div>
            </div>
          </section>
        )}
        <section className="panel">
          <h3 style={{ marginBottom: 14 }}>⚙️ Preferencias</h3>
          {([['notificaciones', 'Notificaciones de viajes'], ['ubicacion', 'Compartir ubicación en vivo'], ['correos', 'Correos con novedades']] as const).map(([k, t]) => (
            <label key={k} className={s.interruptor} style={{ marginBottom: 14 }}>
              <input type="checkbox" checked={prefs[k]} onChange={() => alternar(k)} />
              <i /> <span>{t}</span>
            </label>
          ))}
        </section>
      </div>

      <button className="btn btn-peligro" style={{ alignSelf: 'flex-start' }} onClick={() => { cerrarSesion(); toast('Sesión cerrada', 'info'); navegar('/login'); }}>
        ⏻ Cerrar sesión
      </button>
    </div>
  );
}
