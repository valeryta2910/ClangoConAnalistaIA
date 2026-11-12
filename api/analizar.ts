// api/analizar.ts — responde en la ruta /api/analizar
// Nota: en api/ los import entre archivos llevan la extensión .js (aunque el archivo sea .ts)
// porque el proyecto usa módulos ES ("type": "module") y Node lo exige en Vercel.
import { consultarIA, formatearIndicadores } from './_adaptadores.js';
import type { IndicadorEntrada } from './_adaptadores.js';

// Instrucciones para el modelo, adaptadas al dominio de CLANGo
// (carpooling universitario: conductores que comparten viaje con otros estudiantes en Pasto)
const INSTRUCCIONES = `Eres un asesor que apoya a conductores de CLANGo, una app de viajes compartidos
entre estudiantes universitarios en Pasto (Colombia), sin formación técnica.
Recibirás los indicadores del panel del conductor entre las etiquetas <datos></datos>.
Responde en español, con tono cercano y en máximo 4 frases:
1) resume cómo va su actividad en general, 2) señala el indicador que requiere más atención
y 3) sugiere una acción concreta para mejorar o mantener sus resultados.
Usa SOLO la información de <datos>; si falta algo, dilo con claridad.`;

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Método no permitido' }, { status: 405 });
    }

    // 1. Leer y validar lo que envía el navegador
    let indicadores: IndicadorEntrada[]; // se valida justo debajo
    try {
      ({ indicadores } = await request.json());
    } catch {
      return Response.json({ error: 'El cuerpo debe ser JSON' }, { status: 400 });
    }
    const valido =
      Array.isArray(indicadores) && indicadores.length > 0 && indicadores.length <= 30;
    if (!valido) {
      return Response.json({ error: 'Envía entre 1 y 30 indicadores' }, { status: 400 });
    }

    // 2. Consultar al proveedor y devolver siempre el mismo formato: { texto }
    try {
      const datos = formatearIndicadores(indicadores);
      const texto = await consultarIA(INSTRUCCIONES, [
        { rol: 'user', contenido: `<datos>\n${datos}\n</datos>` },
      ]);
      return Response.json({ texto });
    } catch (error) {
      // El detalle se ve en la terminal o en los logs de Vercel, NO en el navegador
      console.error(error);
      return Response.json({ error: 'El servicio de IA no respondió' }, { status: 502 });
    }
  },
};
