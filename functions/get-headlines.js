// Cloudflare Pages function: uses env.GEMINI_API_KEY to generate structured
// local crime/safety related headline summaries for Albany, NY.
// Returns JSON: { articles: [{ title, url, source, date, summary }] }
// For demonstration this synthesizes articles instead of scraping external sites.

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

function buildPrompt() {
  return `Generate between 3 and 8 JSON articles about very recent (past 7 days) public safety, policing, crime prevention, community safety initiatives, courts, or notable incidents in Albany, NY using only broadly known or plausible local context.\n` +
    `Return ONLY strict JSON of shape: {"articles":[{"title":"string","url":"string","source":"string","date":"ISO8601 date","summary":"string"}]}\n` +
    `Rules:\n- Do not fabricate specific private details.\n- Use generic https://example.com/... placeholder URLs slugified from title.\n- source: short outlet name (e.g., 'Local News', 'Press Release').\n- date: ISO 8601 (YYYY-MM-DD). Use current date or last 7 days.\n- summary: max 200 chars, neutral.\n- If unsure, return empty list.\nRespond with JSON only.`;
}

async function callGemini(apiKey, prompt) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
  };
  const resp = await fetch(GEMINI_API_URL(GEMINI_MODEL) + `?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${txt.slice(0,400)}`);
  }
  const data = await resp.json();
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts.map(p => p.text).join('\n');
  return text || '';
}

function safeParseArticles(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) throw new Error('No JSON object found in model response');
  let parsed;
  try { parsed = JSON.parse(jsonMatch[0]); } catch { throw new Error('Invalid JSON returned by model'); }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.articles)) {
    throw new Error('JSON missing articles array');
  }
  parsed.articles = parsed.articles.filter(a => a && typeof a === 'object').map(a => ({
    title: String(a.title || '').slice(0,140),
    url: String(a.url || '').slice(0,300),
    source: String(a.source || 'Unknown').slice(0,60),
    date: String(a.date || new Date().toISOString().split('T')[0]),
    summary: String(a.summary || '').slice(0,300)
  }));
  return parsed;
}

export async function onRequest({ env }) {
  try {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const prompt = buildPrompt();
    const modelText = await callGemini(apiKey, prompt);
    const parsed = safeParseArticles(modelText);
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
