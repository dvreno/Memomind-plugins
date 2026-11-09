// A fake OpenClaw gateway for tests. Mimics /v1/chat/completions only.
//   mode "multi"  → model "openclaw" gets 400 "Multiple agents are configured..."; "openclaw/<id>" streams SSE
//   mode "single" → any model streams SSE
// Requires `Authorization: Bearer <token>` when a token is set.
import http from 'node:http';

export const MULTI_AGENT_BODY = JSON.stringify({
  error: { message: 'Multiple agents are configured, but this operation has no explicit owner.', type: 'invalid_request_error' },
});

export function startMockGateway({ mode = 'multi', token = null } = {}) {
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
        res.writeHead(401, { 'content-type': 'application/json' }).end('{"error":{"message":"unauthorized"}}');
        return;
      }
      if (mode === 'multi' && body?.model === 'openclaw') {
        res.writeHead(400, { 'content-type': 'application/json' }).end(MULTI_AGENT_BODY);
        return;
      }
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'ok' } }], model: body?.model })}\n\n`);
      setTimeout(() => { res.write('data: [DONE]\n\n'); res.end(); }, 20);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port, url: `http://127.0.0.1:${port}`, requests, close: () => new Promise((r) => server.close(r)) });
    });
  });
}
