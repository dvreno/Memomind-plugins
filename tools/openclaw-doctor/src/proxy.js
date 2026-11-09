// `openclaw-doctor proxy`: tiny HTTP/SSE pass-through for multi-agent gateways.
//
// The MemoMind app always sends model "openclaw". A gateway with more than one
// agent rejects that with 400 "Multiple agents are configured...". This proxy
// rewrites model "openclaw" to "openclaw/<agent>" and forwards everything else
// untouched, Authorization included. It streams the SSE response straight back.
//
// Safety:
// - It never logs headers or bodies. Each request gets one line: method, path, status, ms.
// - It only forwards paths under /v1/.
// - It won't bind 0.0.0.0 / :: unless you pass --allow-all-interfaces.
import http from 'node:http';
import https from 'node:https';

const HOP_BY_HOP = ['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'te', 'trailer', 'host', 'content-length'];
const MAX_BODY = 10 * 1024 * 1024;
const WILDCARD = new Set(['0.0.0.0', '::', '[::]', '']);

/** Rewrite the model in a JSON body buffer. Returns { body, rewritten }. */
export function rewriteModel(buf, agent) {
  let json;
  try { json = JSON.parse(buf.toString('utf8')); } catch { return { body: buf, rewritten: false }; }
  if (json && typeof json === 'object' && json.model === 'openclaw') {
    json.model = `openclaw/${agent}`;
    return { body: Buffer.from(JSON.stringify(json)), rewritten: true };
  }
  return { body: buf, rewritten: false };
}

export function assertSafeListen(listen, allowAll) {
  if (!listen) throw new Error('--listen <ip> is required (your Tailscale 100.x IP or LAN IP).');
  if (WILDCARD.has(listen) && !allowAll) {
    throw new Error(`Refusing to bind ${listen || '(all interfaces)'}: pass your Tailscale or LAN IP, or add --allow-all-interfaces.`);
  }
}

export function createProxy({ upstream, agent = 'main', log = (line) => console.log(line) }) {
  const up = new URL(upstream);
  const client = up.protocol === 'https:' ? https : http;

  return http.createServer((req, res) => {
    const started = Date.now();
    let rewritten = false;
    const finish = (status) => log(`${new Date().toISOString()} ${req.method} ${req.url.split('?')[0]} → ${status} ${Date.now() - started}ms${rewritten ? ` (model → openclaw/${agent})` : ''}`);

    if (!req.url.startsWith('/v1/')) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('openclaw-doctor proxy: only /v1/ is forwarded\n');
      return finish(404);
    }

    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { res.writeHead(413).end(); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (res.writableEnded) return finish(413);
      let body = Buffer.concat(chunks);
      if (body.length && /json/i.test(req.headers['content-type'] || '')) {
        ({ body, rewritten } = rewriteModel(body, agent));
      }
      const headers = { ...req.headers };
      for (const h of HOP_BY_HOP) delete headers[h];
      headers.host = up.host;
      if (body.length) headers['content-length'] = String(body.length);

      const target = new URL(req.url, up);
      const upReq = client.request(target, { method: req.method, headers }, (upRes) => {
        const outHeaders = { ...upRes.headers };
        delete outHeaders.connection;
        res.writeHead(upRes.statusCode, outHeaders);
        res.flushHeaders?.();
        upRes.pipe(res);
        upRes.on('end', () => finish(upRes.statusCode));
      });
      upReq.on('error', (e) => {
        if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' });
        res.end('openclaw-doctor proxy: upstream unreachable\n');
        log(`${new Date().toISOString()} ${req.method} ${req.url.split('?')[0]} → 502 upstream error: ${e.code || e.message}`);
      });
      res.on('close', () => upReq.destroy()); // client hung up: stop the upstream stream too
      upReq.end(body);
    });
  });
}

export function startProxy({ listen, port = 18795, upstream, agent = 'main', allowAllInterfaces = false, log }) {
  assertSafeListen(listen, allowAllInterfaces);
  const server = createProxy({ upstream, agent, log });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, listen, () => resolve(server));
  });
}
