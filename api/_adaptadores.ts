// api/_adaptadores.ts — se ejecuta en el SERVIDOR de Vercel, nunca en el navegador
// El guion bajo inicial le indica a Vercel que es un archivo auxiliar y NO una ruta pública.
// Proveedor de IA: Google Gemini API (modelo gemini-2.5-flash).

export type MensajeIA = { rol: 'user' | 'assistant'; contenido: string };

// Forma de cada indicador que llega desde el dashboard de CLANGo (MetricaProyecto)
export type IndicadorEntrada = { titulo: unknown; valor: unknown; estado: unknown };

// Modelo fijo. La clave se lee SOLO de la variable de entorno GEMINI_API_KEY (configurada en Vercel).
const MODELO = 'gemini-3.5-flash';
const URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIEMPO_MAXIMO_MS = 25_000; // si Gemini no responde en 25 s, se cancela

// Códigos que identifican QUÉ falló (los usa analizar.ts para responder al navegador)
export type CodigoErrorIA =
  | 'CLAVE_NO_CONFIGURADA' // falta GEMINI_API_KEY en Vercel
  | 'API_KEY_INVALIDA' // la clave existe pero Gemini la rechaza
  | 'MODELO_NO_ENCONTRADO' // el modelo no existe o no está disponible
  | 'CUOTA_AGOTADA' // límite de uso (429)
  | 'CONEXION' // no se pudo llegar a Gemini (red o tiempo agotado)
  | 'RESPUESTA_VACIA' // Gemini respondió pero sin texto (por ejemplo, bloqueo de seguridad)
  | 'ERROR_GEMINI'; // cualquier otro error del servicio

export class ErrorIA extends Error {
  codigo: CodigoErrorIA;
  constructor(codigo: CodigoErrorIA, detalle: string) {
    super(detalle);
    this.name = 'ErrorIA';
    this.codigo = codigo;
  }
}

// Convierte la lista de indicadores en texto plano para incluirlo en el prompt.
// Recorta cada campo para que nadie pueda colar textos enormes en la petición.
export function formatearIndicadores(indicadores: IndicadorEntrada[]): string {
  return indicadores
    .slice(0, 30) // como máximo 30 indicadores
    .map(
      (i) =>
        `- ${String(i.titulo).slice(0, 60)}: ${String(i.valor).slice(0, 20)}` +
        ` (estado: ${String(i.estado).slice(0, 15)})`,
    )
    .join('\n');
}

// Traduce la respuesta de error de Gemini a un código claro
function clasificarError(status: number, cuerpo: string): ErrorIA {
  const texto = cuerpo.toLowerCase();
  const detalle = `Gemini respondió ${status}: ${cuerpo.slice(0, 500)}`;

  // Gemini responde 400 (y a veces 401/403) cuando la clave es incorrecta
  if (
    texto.includes('api_key_invalid') ||
    texto.includes('api key not valid') ||
    texto.includes('api key expired') ||
    status === 401 ||
    status === 403
  ) {
    return new ErrorIA('API_KEY_INVALIDA', detalle);
  }
  if (status === 404 || (texto.includes('model') && texto.includes('not found'))) {
    return new ErrorIA('MODELO_NO_ENCONTRADO', detalle);
  }
  if (status === 429) return new ErrorIA('CUOTA_AGOTADA', detalle);
  return new ErrorIA('ERROR_GEMINI', detalle);
}

// Envía las instrucciones y los mensajes a Gemini y devuelve SOLO el texto
export async function consultarIA(
  instrucciones: string,
  mensajes: MensajeIA[],
): Promise<string> {
  const clave = process.env.GEMINI_API_KEY?.trim();
  if (!clave) {
    throw new ErrorIA('CLAVE_NO_CONFIGURADA', 'Falta la variable de entorno GEMINI_API_KEY');
  }

  let r: Response;
  try {
    r = await fetch(`${URL_BASE}/${MODELO}:generateContent`, {
      method: 'POST',
      // La clave viaja en un encabezado (no en la URL) para que no quede en los logs
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instrucciones }] },
        contents: mensajes.map((m) => ({
          // Gemini llama 'model' al asistente
          role: m.rol === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.contenido }],
        })),
      }),
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch (e) {
    // Solo llega aquí si no hubo conexión o se agotó el tiempo
    const motivo = e instanceof Error ? e.message : String(e);
    throw new ErrorIA('CONEXION', `No se pudo conectar con Gemini: ${motivo}`);
  }

  if (!r.ok) throw clasificarError(r.status, await r.text());

  const datos = await r.json();
  // El texto está en candidates[0].content.parts
  const texto: string =
    datos.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';

  if (!texto.trim()) {
    const motivo = datos.promptFeedback?.blockReason ?? datos.candidates?.[0]?.finishReason ?? 'desconocido';
    throw new ErrorIA('RESPUESTA_VACIA', `Gemini no devolvió texto (motivo: ${motivo})`);
  }
  return texto;
}