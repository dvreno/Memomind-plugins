// A fake OpenClaw gateway for tests. Mimics /v1/chat/completions only, with the
// response shapes captured from a real OpenClaw 2026.11.2 gateway:
//   mode "multi"    → model "openclaw" gets 400 "Multiple agents are configured..."; "openclaw/<id>" streams SSE
//   mode "single"   → any model streams SSE
//   noProvider:true → like an agent with no model credentials: streaming gets 200 + an
//                     in-stream error event; non-streaming gets 401 authentication_error
// Streams start with a role-only chunk, as the real gateway does.
// Requires `Authorization: Bearer <token>` when a token is set.
import http from 'node:http';

export const MULTI_AGENT_BODY = JSON.stringify({
  error: {
    message: 'Multiple agents are configured, but this operation has no explicit owner. Select an agent explicitly; CLI callers can pass --agent <id>, channels can add a binding, and ambient services can set their agentId target.',
    type: 'invalid_request_error',
  },
});
const PROVIDER_ERROR = { error: { message: 'No route-compatible authentication source is configured for openai.', type: 'authentication_error' } };

export function startMockGateway({ mode = 'multi', token = null, noProvider = false } = {}) {
  const requests = [];
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      let body = null;
      try { body = JSON.parse(raw); } catch { /* not JSON */ }
      requests.push({ method: req.method, url: req.url, headers: req.headers, body });

      if (req.url !== '/v1/chat/completions' || req.method !== 'POST') {
        res.writeHead(404).end('not found');
        return;
      }
      if (token && req.headers.authorization !== `Bearer ${token}`) {
        res.writeHead(401, { 'content-type': 'application/json' }).end('{"error":{"message":"Unauthorized","type":"unauthorized"}}');
        return;
      }
      if (mode === 'multi' && body?.model === 'openclaw') {
        res.writeHead(400, { 'content-type': 'application/json' }).end(MULTI_AGENT_BODY);
        return;
      }
      if (noProvider && body?.stream !== true) {
        res.writeHead(401, { 'content-type': 'application/json' }).end(JSON.stringify(PROVIDER_ERROR));
        return;
      }
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      res.write(`data: ${JSON.stringify({ object: 'chat.completion.chunk', model: body?.model, choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }] })}\n\n`);
      setTimeout(() => {
        const next = noProvider ? PROVIDER_ERROR : { model: body?.model, choices: [{ index: 0, delta: { content: 'ok' } }] };
        res.write(`data: ${JSON.stringify(next)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }, 20);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port, url: `http://127.0.0.1:${port}`, requests, close: () => new Promise((r) => server.close(r)) });
    });
  });
}
