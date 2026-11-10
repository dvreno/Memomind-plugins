import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startMockGateway } from './mock-gateway.js';
import { runDoctor, renderReport, exitCode } from '../src/doctor.js';
import { chatProbe } from '../src/net.js';
import { extractRequestIds, pendingApprovals, tailscaleInfo } from '../src/external.js';

const noCli = async () => ({ cliMissing: true });
const noTs = async () => ({ missing: true });

test('chatProbe detects the 400 multi-agent error', async () => {
  const gw = await startMockGateway({ mode: 'multi' });
  try {
    const r = await chatProbe(gw.url, {});
    assert.equal(r.kind, 'multi_agent');
    assert.equal(r.status, 400);
    assert.equal(gw.requests[0].body.model, 'openclaw');
  } finally { await gw.close(); }
});

test('chatProbe: ok on single-agent gateway, unauthorized on bad token', async () => {
  const gw = await startMockGateway({ mode: 'single', token: 'secret-token-123' });
  try {
    assert.equal((await chatProbe(gw.url, { token: 'secret-token-123' })).kind, 'ok');
    assert.equal((await chatProbe(gw.url, { token: 'wrong' })).kind, 'unauthorized');
  } finally { await gw.close(); }
});

test('chatProbe: network_error when nothing listens', async () => {
  const r = await chatProbe('http://127.0.0.1:1', { timeoutMs: 2000 });
  assert.equal(r.kind, 'network_error');
});

test('doctor on a multi-agent gateway recommends the proxy and its SSE URL', async () => {
  const gw = await startMockGateway({ mode: 'multi', token: 'tok-abcdef-999' });
  try {
    const report = await runDoctor(
      { gateway: gw.url, token: 'tok-abcdef-999', tailscaleIp: '127.0.0.1', agent: 'main' },
      { pendingApprovals: noCli, tailscaleInfo: noTs },
    );
    const text = renderReport(report);
    assert.match(text, /Multi-agent gateway/);
    assert.match(text, /openclaw\/main/);
    assert.equal(report.sse, 'http://127.0.0.1:18795/v1/chat/completions');
    assert.match(report.proxyCommand, /--listen 127\.0\.0\.1 --port 18795/);
    assert.match(text, /Initialization returned false/);
    assert.ok(!text.includes('tok-abcdef-999'), 'token must never be printed');
    assert.equal(exitCode(report), 1);
  } finally { await gw.close(); }
});

test('doctor on a healthy single-agent gateway passes and points SSE at the gateway', async () => {
  const gw = await startMockGateway({ mode: 'single' });
  try {
    const report = await runDoctor(
      { gateway: gw.url, tailscaleIp: '127.0.0.1', skipCli: true },
      { tailscaleInfo: noTs },
    );
    assert.equal(exitCode(report), 0, renderReport(report));
    assert.equal(report.sse, `http://127.0.0.1:${gw.port}/v1/chat/completions`);
    assert.equal(report.proxyCommand, null);
  } finally { await gw.close(); }
});

test('doctor flags a gateway bound to localhost only', async () => {
  const gw = await startMockGateway({ mode: 'single' });
  try {
    const tcpProbe = async (host) => (host === '100.64.0.5' ? { ok: false, error: 'ECONNREFUSED', ms: 1 } : { ok: true, ms: 1 });
    const report = await runDoctor(
      { gateway: gw.url, tailscaleIp: '100.64.0.5', skipCli: true, skipChat: true },
      { tcpProbe, tailscaleInfo: noTs },
    );
    assert.match(renderReport(report), /bound to localhost only/);
    assert.equal(report.ws, `ws://100.64.0.5:${gw.port}`, 'never suggest a loopback address to the phone');
    assert.equal(report.unverified, true);
  } finally { await gw.close(); }
});

test('doctor flags an offline phone in the tailnet', async () => {
  const report = await runDoctor(
    { gateway: 'http://127.0.0.1:1', skipCli: true },
    {
      tcpProbe: async () => ({ ok: false, error: 'ECONNREFUSED', ms: 1 }),
      tailscaleInfo: async () => ({ missing: false, running: true, selfIp: '100.70.0.1', phones: [{ name: 'pixel', os: 'android', online: false }] }),
    },
  );
  assert.match(renderReport(report), /"pixel" \(android\) is OFFLINE/);
});

const doctorWith = (runner) => runDoctor(
  { gateway: 'http://127.0.0.1:1', skipChat: true, skipTailscale: true },
  { tcpProbe: async () => ({ ok: true, ms: 1 }), pendingApprovals: () => pendingApprovals(runner) },
);

test('doctor reads --json, prints approve commands, and never runs them', async () => {
  const calls = [];
  const runner = async (cmd, args) => {
    calls.push([cmd, ...args].join(' '));
    if (args[0] === 'devices') {
      // Shape captured from OpenClaw 2026.11.2 (`paired` entry trimmed).
      return { ok: true, stderr: '', stdout: JSON.stringify({ pending: [{ requestId: 'req7f3a9c', displayName: 'MemoMind-Pixel' }], paired: [{ deviceId: 'abc12345', displayName: 'laptop' }] }) };
    }
    return { ok: true, stderr: '', stdout: JSON.stringify([{ requestId: 'node-9b2e41' }]) };
  };
  const text = renderReport(await doctorWith(runner));
  assert.match(text, /openclaw devices approve req7f3a9c/);
  assert.match(text, /openclaw nodes approve node-9b2e41/);
  assert.ok(!text.includes('devices approve abc12345'), 'already-paired device must not be listed');
  assert.deepEqual(calls, ['openclaw devices list --json', 'openclaw nodes pending --json']);
  assert.ok(calls.every((c) => !c.includes('approve')), 'doctor must never approve');
});

test('doctor never says "nothing pending" when a pending entry has an unknown ID field', async () => {
  const runner = async (_cmd, args) => ({
    ok: true, stderr: '',
    stdout: args[0] === 'devices' ? JSON.stringify({ pending: [{ ticket: 'x' }], paired: [] }) : '[]',
  });
  const text = renderReport(await doctorWith(runner));
  assert.match(text, /1 pending device request\(s\) without a recognisable ID/);
  assert.ok(!/No pending device requests/.test(text));
});

test('doctor falls back to the text table when --json is rejected', async () => {
  const calls = [];
  const runner = async (_cmd, args) => {
    calls.push(args.join(' '));
    if (args.includes('--json')) return { ok: false, stdout: '', stderr: "error: unknown option '--json'" };
    if (args[0] === 'devices') return { ok: true, stdout: 'ID        STATUS   NAME\nreq7f3a9c  pending  MemoMind-Pixel\nabc12345  paired   laptop\n', stderr: '' };
    return { ok: true, stdout: 'node-9b2e41  memomind.control  requested 2m ago\n', stderr: '' };
  };
  const text = renderReport(await doctorWith(runner));
  assert.match(text, /openclaw devices approve req7f3a9c/);
  assert.match(text, /openclaw nodes approve node-9b2e41/);
  assert.match(text, /IDs above were guessed/);
  assert.deepEqual(calls, ['devices list --json', 'devices list', 'nodes pending --json', 'nodes pending']);
});

test('chatProbe: 200 stream with an in-stream error is a provider_error, not ok', async () => {
  const gw = await startMockGateway({ mode: 'single', noProvider: true });
  try {
    const r = await chatProbe(gw.url, {});
    assert.equal(r.kind, 'provider_error');
    assert.equal(r.status, 200);
    assert.match(r.detail, /No route-compatible authentication source/);
  } finally { await gw.close(); }
});

test('doctor tells a provider problem apart from a bad token', async () => {
  const gw = await startMockGateway({ mode: 'single', token: 'tok-1234567', noProvider: true });
  try {
    const report = await runDoctor(
      { gateway: gw.url, token: 'tok-1234567', tailscaleIp: '127.0.0.1', skipCli: true },
      { tailscaleInfo: noTs },
    );
    const text = renderReport(report);
    assert.match(text, /The gateway and token work, but the agent can't reach its model/);
    assert.ok(!/refused the token/.test(text));
    assert.equal(exitCode(report), 1);
  } finally { await gw.close(); }
});

test('doctor explains what to run when the openclaw CLI is missing', async () => {
  const report = await runDoctor(
    { gateway: 'http://127.0.0.1:1', skipChat: true, skipTailscale: true },
    { tcpProbe: async () => ({ ok: true, ms: 1 }), pendingApprovals: noCli },
  );
  assert.match(renderReport(report), /openclaw nodes approve <nodeRequestId>/);
});

test('extractRequestIds handles UUIDs and skips header rows', () => {
  const out = 'Request ID                            Status\n1b4e28ba-2fa1-11d2-883f-0016d3cca427  pending\n';
  assert.deepEqual(extractRequestIds(out, { pendingOnly: true }), ['1b4e28ba-2fa1-11d2-883f-0016d3cca427']);
});

test('tailscaleInfo parses self IP and phones', async () => {
  const json = JSON.stringify({
    BackendState: 'Running',
    Self: { TailscaleIPs: ['100.70.57.72', 'fd7a::1'], DNSName: 'mac.tail1.ts.net.' },
    Peer: {
      a: { HostName: 'iphone', OS: 'iOS', Online: true, TailscaleIPs: ['100.1.1.1'] },
      b: { HostName: 'nas', OS: 'linux', Online: true, TailscaleIPs: ['100.1.1.2'] },
    },
  });
  const info = await tailscaleInfo(async () => ({ ok: true, stdout: json, stderr: '' }));
  assert.equal(info.selfIp, '100.70.57.72');
  assert.equal(info.magicDns, 'mac.tail1.ts.net');
  assert.deepEqual(info.phones, [{ name: 'iphone', os: 'iOS', online: true, ip: '100.1.1.1' }]);
});
