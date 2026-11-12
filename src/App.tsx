// src/App.tsx — Componente raíz: define las rutas de la SPA
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { Layout } from './componentes/Layout';
import Inicio from './paginas/Inicio';
import Registro from './paginas/Registro';
import Login from './paginas/Login';
import Recuperar from './paginas/Recuperar';
import Viajes from './paginas/Viajes';
import Detalle from './paginas/Detalle';
import Chat from './paginas/Chat';
import Seguimiento from './paginas/Seguimiento';
import Calificacion from './paginas/Calificacion';
import Dashboard from './paginas/Dashboard';
import Publicar from './paginas/Publicar';
import Publicado from './paginas/Publicado';
import Perfil from './paginas/Perfil';

export default function App() {
  return (
    <Routes>
      {/* Pantallas públicas */}
      <Route path="/" element={<Inicio />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar" element={<Recuperar />} />

      {/* Pantallas privadas (requieren sesión): comparten barra lateral y cabecera */}
      <Route element={<Layout />}>
        <Route path="/viajes" element={<Viajes />} />
        <Route path="/detalle" element={<Detalle />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/seguimiento" element={<Seguimiento />} />
        <Route path="/calificacion" element={<Calificacion />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/publicado" element={<Publicado />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
