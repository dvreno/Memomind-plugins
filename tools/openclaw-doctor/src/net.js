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

/**
 * POST a tiny streaming chat request the way the MemoMind app does (model "openclaw").
 * Reads only until the first bytes of a 2xx body arrive, then aborts, so a
 * working gateway costs one very short agent turn at most.
 *
 * Resolves { kind, status, detail } where kind is one of:
 *   ok | multi_agent | unauthorized | not_found | http_error | network_error
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
      // Read the first chunk only to prove the stream starts.
      let first = '';
      try {
        const reader = res.body.getReader();
        const { value } = await reader.read();
        first = value ? new TextDecoder().decode(value).slice(0, 200) : '';
        await reader.cancel();
      } catch { /* aborted after first chunk: fine */ }
      return { kind: 'ok', status: res.status, detail: first.trim() };
    }
    const text = (await res.text().catch(() => '')).slice(0, 500);
    if (res.status === 400 && MULTI_AGENT_RE.test(text)) return { kind: 'multi_agent', status: 400, detail: text };
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
