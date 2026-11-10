import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startMockGateway } from './mock-gateway.js';
import { startProxy, rewriteModel, assertSafeListen } from '../src/proxy.js';

async function withProxy(gwOpts, proxyOpts, fn) {
  const gw = await startMockGateway(gwOpts);
  const logs = [];
  const proxy = await startProxy({ listen: '127.0.0.1', port: 0, upstream: gw.url, log: (l) => logs.push(l), ...proxyOpts });
  const base = `http://127.0.0.1:${proxy.address().port}`;
  try { await fn({ gw, base, logs }); } finally {
    await new Promise((r) => proxy.close(r));
    await gw.close();
  }
}

const post = (url, body, headers = {}) => fetch(url, {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('direct call to multi-agent gateway is 400; through the proxy it streams', async () => {
  await withProxy({ mode: 'multi', token: 'sekret-token-xyz' }, { agent: 'main' }, async ({ gw, base, logs }) => {
    const auth = { authorization: 'Bearer sekret-token-xyz' };
    const direct = await post(`${gw.url}/v1/chat/completions`, { model: 'openclaw', stream: true, messages: [] }, auth);
    assert.equal(direct.status, 400);
    assert.match(await direct.text(), /Multiple agents are configured/);

    const via = await post(`${base}/v1/chat/completions`, { model: 'openclaw', stream: true, messages: [{ role: 'user', content: 'hi' }] }, auth);
    assert.equal(via.status, 200);
    assert.match(via.headers.get('content-type'), /text\/event-stream/);
    const text = await via.text();
    assert.match(text, /data: \[DONE\]/);

    const last = gw.requests.at(-1);
    assert.equal(last.body.model, 'openclaw/main');
    assert.equal(last.body.messages[0].content, 'hi', 'rest of body forwarded unchanged');
    assert.equal(last.headers.authorization, 'Bearer sekret-token-xyz', 'Authorization passed through');

    const allLogs = logs.join('\n');
    assert.ok(!allLogs.includes('sekret-token-xyz'), 'secrets never logged');
    assert.ok(!allLogs.includes('hi'), 'bodies never logged');
    assert.match(allLogs, /POST \/v1\/chat\/completions → 200 .*model → openclaw\/main/);
  });
});

test('configurable agent and explicit models are left alone', async () => {
  await withProxy({ mode: 'multi' }, { agent: 'work' }, async ({ gw, base }) => {
    await (await post(`${base}/v1/chat/completions`, { model: 'openclaw', messages: [] })).text();
    assert.equal(gw.requests.at(-1).body.model, 'openclaw/work');
    await (await post(`${base}/v1/chat/completions`, { model: 'openclaw/other', messages: [] })).text();
    assert.equal(gw.requests.at(-1).body.model, 'openclaw/other');
  });
});

test('only /v1/ is forwarded', async () => {
  await withProxy({ mode: 'single' }, {}, async ({ gw, base }) => {
    const r = await fetch(`${base}/admin`);
    assert.equal(r.status, 404);
    await r.text();
    assert.equal(gw.requests.length, 0);
  });
});

test('upstream down gives 502', async () => {
  const proxy = await startProxy({ listen: '127.0.0.1', port: 0, upstream: 'http://127.0.0.1:1', log: () => {} });
  try {
    const r = await post(`http://127.0.0.1:${proxy.address().port}/v1/chat/completions`, { model: 'openclaw' });
    assert.equal(r.status, 502);
    await r.text();
  } finally { await new Promise((res) => proxy.close(res)); }
});

test('refuses to bind all interfaces by default, and requires --listen', () => {
  assert.throws(() => assertSafeListen('0.0.0.0', false), /Refusing to bind/);
  assert.throws(() => assertSafeListen('::', false), /Refusing to bind/);
  assert.throws(() => assertSafeListen(undefined, false), /required/);
  assert.doesNotThrow(() => assertSafeListen('0.0.0.0', true));
  assert.doesNotThrow(() => assertSafeListen('100.70.57.72', false));
});

test('rewriteModel ignores non-JSON and other models', () => {
  assert.equal(rewriteModel(Buffer.from('not json'), 'main').rewritten, false);
  assert.equal(rewriteModel(Buffer.from('{"model":"gpt"}'), 'main').rewritten, false);
  assert.equal(JSON.parse(rewriteModel(Buffer.from('{"model":"openclaw"}'), 'x').body).model, 'openclaw/x');
});
