// api/_adaptadores.ts — se ejecuta en el SERVIDOR de Vercel, nunca en el navegador
// El guion bajo inicial le indica a Vercel que es un archivo auxiliar y NO una ruta pública.

export type MensajeIA = { rol: 'user' | 'assistant'; contenido: string };

// Forma de cada indicador que llega desde el dashboard de CLANGo (MetricaProyecto)
export type IndicadorEntrada = { titulo: unknown; valor: unknown; estado: unknown };

const PROVEEDOR = process.env.PROVEEDOR ?? 'gemini';
const CLAVE = process.env.IA_API_KEY;
const MODELO = process.env.IA_MODELO;

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

// Envía las instrucciones y los mensajes al proveedor elegido y devuelve SOLO el texto
export async function consultarIA(
  instrucciones: string,
  mensajes: MensajeIA[],
): Promise<string> {
  if (!CLAVE || !MODELO) throw new Error('Faltan las variables IA_API_KEY o IA_MODELO');

  // ---------- OpenAI (Responses API) ----------
  if (PROVEEDOR === 'openai') {
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CLAVE}` },
      body: JSON.stringify({
        model: MODELO,
        instructions: instrucciones,
        input: mensajes.map((m) => ({ role: m.rol, content: m.contenido })),
      }),
    });
    if (!r.ok) throw new Error(`OpenAI respondió ${r.status}: ${await r.text()}`);
    const datos = await r.json();
    // El texto está en output → message → content → output_text
    return (datos.output ?? [])
      .filter((item: any) => item.type === 'message')
      .flatMap((item: any) => item.content)
      .filter((parte: any) => parte.type === 'output_text')
      .map((parte: any) => parte.text)
      .join('');
  }

  // ---------- Google (Gemini API) ----------
  if (PROVEEDOR === 'gemini') {
    const base = 'https://generativelanguage.googleapis.com/v1beta/models';
    const url = `${base}/${MODELO}:generateContent`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CLAVE },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instrucciones }] },
        contents: mensajes.map((m) => ({
          // Gemini llama 'model' al asistente
          role: m.rol === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.contenido }],
        })),
      }),
    });
    if (!r.ok) throw new Error(`Gemini respondió ${r.status}: ${await r.text()}`);
    const datos = await r.json();
    // El texto está en candidates[0].content.parts
    return datos.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
  }

  // ---------- Hugging Face (formato Chat Completions) ----------
  const r = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CLAVE}` },
    body: JSON.stringify({
      model: MODELO,
      messages: [
        { role: 'system', content: instrucciones },
        ...mensajes.map((m) => ({ role: m.rol, content: m.contenido })),
      ],
    }),
  });
  if (!r.ok) throw new Error(`Hugging Face respondió ${r.status}: ${await r.text()}`);
  const datos = await r.json();
  // El texto está en choices[0].message.content
  return datos.choices?.[0]?.message?.content ?? '';
}
