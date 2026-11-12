// src/componentes/PanelIA.tsx — "Analista IA" (Unidad 3 · Tema 2)
import { useState } from 'react';
import type { MetricaProyecto } from '../types/index';
import { analizarIndicadores } from '../services/ia';
import styles from './PanelIA.module.css';

interface PanelIAProps {
  indicadores: MetricaProyecto[]; // las mismas métricas que muestra el dashboard
  deshabilitado?: boolean; // por ejemplo, mientras el dashboard aún está cargando datos
}

export const PanelIA = ({ indicadores, deshabilitado = false }: PanelIAProps) => {
  // Los tres estados que ya conoces: resultado, carga y error
  const [analisis, setAnalisis] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analizar = async () => {
    setCargando(true);
    setError(null);
    try {
      // AbortSignal.timeout cancela la petición si tarda más de 30 segundos
      const texto = await analizarIndicadores(indicadores, AbortSignal.timeout(30_000));
      setAnalisis(texto);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    } finally {
      setCargando(false); // se ejecuta siempre, con éxito o con error
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="titulo-ia">
      <div className={styles.cabecera}>
        <div>
          <h2 id="titulo-ia" className={styles.titulo}>
            <span className={styles.chispa} aria-hidden="true">✨</span>
            Analista IA
          </h2>
          <p className={styles.subtitulo}>Un resumen de tu actividad, explicado en pocas frases.</p>
        </div>
        <button
          className={styles.boton}
          onClick={analizar}
          disabled={cargando || deshabilitado || indicadores.length === 0}
        >
          {cargando ? 'Analizando…' : analisis ? 'Volver a analizar' : 'Analizar indicadores con IA'}
        </button>
      </div>

      {/* Renderizado condicional de los estados */}
      {cargando && (
        <div className={styles.esqueleto} aria-hidden="true">
          <div className={styles.linea} />
          <div className={styles.linea} />
          <div className={styles.linea} />
        </div>
      )}

      {error && <p role="alert" className={styles.error}>{error}</p>}

      {analisis && !error && !cargando && (
        <div aria-live="polite">
          <p className={styles.texto}>{analisis}</p>
          <small className={styles.aviso}>
            Generado por IA ({indicadores.length} indicadores) · verifica antes de decidir.
          </small>
        </div>
      )}

      {!analisis && !error && !cargando && (
        <p className={styles.vacio}>Pulsa el botón para obtener un resumen.</p>
      )}
    </section>
  );
};
