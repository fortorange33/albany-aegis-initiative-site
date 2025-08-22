// Cloudflare Pages function: uses env.GEMINI_API_KEY to call the Gemini API
// Summarize recent Albany police scanner logs (placeholder text for now) and
// return JSON: { incidents: [{ type, location, summary }] }
// Returns 500 if API key missing or response invalid.

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/**
 * Build a structured prompt asking Gemini to output normalized JSON.
 */
function buildPrompt(scannerText) {
  return `You are an assistant that extracts notable public safety incidents from raw police scanner style log text for Albany, NY.\n` +
    `Return ONLY strict JSON with this shape: {"incidents":[{"type":"string","location":"string","summary":"string"}]}\n` +
    `Rules: \n- 3 to 12 incidents.\n- type: short lowercase category (traffic, fire, assault, theft, burglary, medical, other).\n- location: concise (street name or intersection if present else "Unknown").\n- summary: one sentence (max 160 chars), neutral tone.\n- If no valid incidents, respond with {"incidents":[]} only.\n` +
    `Source log:\n---\n${scannerText}\n---`;
}

async function callGemini(apiKey, prompt) {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 512
    }
  };

  const resp = await fetch(GEMINI_API_URL(GEMINI_MODEL) + `?key=${apiKey}` , {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${txt.slice(0,400)}`);
  }
  const data = await resp.json();
  // Gemini responses nest text in data.candidates[0].content.parts[].text
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts.map(p => p.text).join('\n');
  return text || '';
}

function safeParseIncidents(text) {
  // Attempt to locate JSON substring.
  const jsonMatch = text.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) throw new Error('No JSON object found in model response');
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error('Invalid JSON returned by model');
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.incidents)) {
    throw new Error('JSON missing incidents array');
  }
  // Basic sanitization
  parsed.incidents = parsed.incidents
    .filter(i => i && typeof i === 'object')
    .map(i => ({
      type: String(i.type || 'other').slice(0,40),
      location: String(i.location || 'Unknown').slice(0,100),
      summary: String(i.summary || '').slice(0,300)
    }));
  return parsed;
}

export async function onRequest(context) {
  try {
    const { env, request } = context;
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // For now, placeholder scanner text. In future, could fetch from a feed.
    const sampleScanner = `ALB DISP: Traffic stop Madison & Lark.\nALB FIRE: Report of smoke 200 Block Central Ave.\nALB EMS: Medical assist 300 block Washington Ave.\nALB PD: Possible burglary in progress 100 Pine St basement.\nALB PD: Shoplifting suspect detained at Pearl St store.`;

    const prompt = buildPrompt(sampleScanner);
    const modelText = await callGemini(apiKey, prompt);
    const parsed = safeParseIncidents(modelText);

    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
