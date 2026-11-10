// Low-level network probes: TCP reachability and the chat-completions check.
import net from 'node:net';

/** Try a TCP connect. Resolves { ok, ms, error }. Never throws. */
export function tcpProbe(host, port, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const started = Date.now();
    const sock = net.connect({ host, port });
    const done = (result) => {
      sock.destroy();
      resolve({ ...result, ms: Date.now() - started });
    };
    sock.setTimeout(timeoutMs, () => done({ ok: false, error: 'timeout' }));
    sock.once('connect', () => done({ ok: true }));
    sock.once('error', (e) => done({ ok: false, error: e.code || e.message }));
  });
}

export const MULTI_AGENT_RE = /multiple agents are configured/i;

/** Pull `error.type` / `error.message` out of an OpenAI-style error body. */
function parseError(text) {
  try {
    const e = JSON.parse(text)?.error;
    if (e && typeof e === 'object') return { type: e.type || '', message: e.message || '' };
  } catch { /* not JSON */ }
  return null;
}

/**
 * Read SSE events until the first text delta, an in-stream error, [DONE], or a
 * size cap. OpenClaw 2026.11.2 answers a streaming request with HTTP 200 and a
 * role-only first chunk *before* the agent runs, then reports agent failures
 * (e.g. no model provider configured) as a `data: {"error":…}` event. So the
 * first chunk alone proves nothing.
 */
async function readStreamVerdict(body, maxBytes = 16384) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let seen = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return { verdict: 'ended' };
      seen += value.length;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') return { verdict: 'ended' };
        const err = parseError(data);
        if (err) return { verdict: 'error', ...err };
        try {
          const delta = JSON.parse(data)?.choices?.[0]?.delta;
          if (delta?.content) return { verdict: 'text' };
        } catch { /* ignore malformed event */ }
      }
      if (seen > maxBytes) return { verdict: 'text' }; // plenty of stream: it works
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

/**
 * POST a tiny streaming chat request the way the MemoMind app does (model "openclaw").
 * Reads until the first text (or error) arrives, then hangs up, so a working
 * gateway costs one very short agent turn at most.
 *
 * Resolves { kind, status, detail } where kind is one of:
 *   ok | no_text | multi_agent | provider_error | unauthorized | not_found | http_error | network_error
 */
export async function chatProbe(baseUrl, { token, model = 'openclaw', timeoutMs = 15000, fetchImpl = fetch } = {}) {
  const url = new URL('/v1/chat/completions', baseUrl).toString();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const headers = { 'content-type': 'application/json', accept: 'text/event-stream' };
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'openclaw-doctor connectivity check: reply with "ok".' }],
      }),
      signal: ctrl.signal,
    });
    if (res.ok) {
      const v = await readStreamVerdict(res.body);
      if (v.verdict === 'text') return { kind: 'ok', status: res.status, detail: '' };
      if (v.verdict === 'error') {
        const kind = MULTI_AGENT_RE.test(v.message) ? 'multi_agent' : 'provider_error';
        return { kind, status: res.status, detail: v.message.slice(0, 500) };
      }
      return { kind: 'no_text', status: res.status, detail: '' };
    }
    const text = (await res.text().catch(() => '')).slice(0, 500);
    const err = parseError(text);
    if (res.status === 400 && MULTI_AGENT_RE.test(text)) return { kind: 'multi_agent', status: 400, detail: text };
    // OpenClaw uses 401 both for a bad gateway token (type "unauthorized") and,
    // on non-streaming calls, for an agent with no model credentials
    // (type "authentication_error"). Only the first is the user's token.
    if (res.status === 401 && err?.type === 'authentication_error') return { kind: 'provider_error', status: 401, detail: err.message };
    if (res.status === 401 || res.status === 403) return { kind: 'unauthorized', status: res.status, detail: text };
    if (res.status === 404 || res.status === 405) return { kind: 'not_found', status: res.status, detail: text };
    return { kind: 'http_error', status: res.status, detail: text };
  } catch (e) {
    const cause = e.cause?.code || e.cause?.message || e.name || e.message;
    return { kind: 'network_error', status: 0, detail: String(cause) };
  } finally {
    clearTimeout(timer);
  }
}
