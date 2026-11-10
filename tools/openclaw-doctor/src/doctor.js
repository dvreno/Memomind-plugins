// `openclaw-doctor doctor`: read-only diagnostics for the MemoMind ⇄ OpenClaw link.
import { tcpProbe, chatProbe } from './net.js';
import { pendingApprovals, tailscaleInfo } from './external.js';
import { scrub } from './redact.js';

export const DEFAULTS = {
  gateway: 'http://127.0.0.1:18789',
  agent: 'main',
  proxyPort: 18795,
};

const INIT_FALSE_EXPLAINER = `About "Initialization returned false" (Memo Lab → OpenClaw → Test Connection):
  The app opened the gateway WebSocket but the gateway didn't accept it as a
  trusted device. In the MemoMind Discord it has had two causes:
    1. The phone isn't approved on the gateway yet. Approve the pending device
       request, then the pending node request (it has a different ID).
    2. Tailscale is off on the phone, so a 100.x or *.ts.net address can't be
       reached. Turn Tailscale on and keep it on (a Wi-Fi ⇄ cellular switch can
       drop the link for ~45 s).
  Tap Test Connection again after fixing either one.`;

/**
 * Run every check. Dependencies are injectable so tests can use a mock gateway.
 * Returns { findings: [{ level, title, lines }], sse, ws, proxyCommand }.
 */
export async function runDoctor(opts = {}, deps = {}) {
  const o = { ...DEFAULTS, ...opts };
  const d = { tcpProbe, chatProbe, pendingApprovals, tailscaleInfo, ...deps };
  const secrets = [o.token];
  const gw = new URL(o.gateway);
  const port = Number(gw.port || (gw.protocol === 'https:' ? 443 : 80));
  const findings = [];
  const add = (level, title, lines = []) => findings.push({ level, title, lines: lines.map((l) => scrub(l, secrets)) });

  // 1. Gateway reachable from this machine?
  const local = await d.tcpProbe(gw.hostname, port);
  if (local.ok) add('ok', `Gateway reachable at ${gw.host}`, [`TCP connect in ${local.ms} ms.`]);
  else add('fail', `Gateway NOT reachable at ${gw.host}`, [
    `TCP error: ${local.error}.`,
    'Is the OpenClaw gateway running? Check the port (default 18789).',
  ]);

  // 2. Reachable over Tailscale, the way the phone would see it?
  let tsIp = o.tailscaleIp || null;
  let tsReachable = false;
  const ts = o.skipTailscale ? { missing: true, skipped: true } : await d.tailscaleInfo();
  if (!tsIp && ts.selfIp) tsIp = ts.selfIp;
  if (ts.missing && !ts.skipped && !tsIp) {
    add('info', 'Tailscale CLI not found', ['Skipping the tailnet check. Pass --tailscale-ip <100.x.y.z> to test it anyway.']);
  } else if (!ts.missing && !ts.running && !tsIp) {
    add('warn', 'Tailscale is not running on this machine', [ts.error || 'Start Tailscale, or use a LAN address.']);
  }
  if (tsIp) {
    const tp = await d.tcpProbe(tsIp, port);
    tsReachable = tp.ok;
    if (tp.ok) add('ok', `Gateway reachable on the Tailscale IP ${tsIp}:${port}`, [`TCP connect in ${tp.ms} ms.`]);
    else if (local.ok) add('fail', `Gateway NOT reachable on ${tsIp}:${port}`, [
      `TCP error: ${tp.error}.`,
      'It answers locally but not on the tailnet address, so it is probably bound to localhost only.',
      'Bind it to the tailnet: `openclaw config set gateway.bind tailnet` and restart the gateway',
      '(or `openclaw gateway run --bind tailnet`), or publish it with Tailscale Serve.',
    ]);
    else add('fail', `Gateway NOT reachable on ${tsIp}:${port}`, [`TCP error: ${tp.error}.`]);
  }
  if (ts.phones) {
    if (ts.phones.length === 0) add('warn', 'No phone found in your tailnet', [
      'Install Tailscale on the phone and sign in to the same tailnet if you use a 100.x or *.ts.net gateway address.',
    ]);
    for (const p of ts.phones) {
      if (p.online) add('ok', `Phone "${p.name}" (${p.os}) is online in the tailnet`, [p.ip ? `Phone IP ${p.ip}.` : '']);
      else add('warn', `Phone "${p.name}" (${p.os}) is OFFLINE in the tailnet`, [
        'Turn Tailscale on in the phone app. This is a known cause of "Initialization returned false".',
      ]);
    }
  }

  // 3. Does /v1/chat/completions answer, as the app calls it?
  let chat = null;
  if (o.skipChat) {
    add('info', 'Chat check skipped (--no-chat)');
  } else if (!local.ok) {
    add('info', 'Chat check skipped: the gateway is unreachable');
  } else {
    chat = await d.chatProbe(o.gateway, { token: o.token, model: 'openclaw' });
    const detail = chat.detail ? [`Gateway said: ${chat.detail}`] : [];
    switch (chat.kind) {
      case 'ok':
        add('ok', '/v1/chat/completions answers with model "openclaw"', [`HTTP ${chat.status}, the agent streamed text.`]);
        break;
      case 'no_text':
        add('warn', '/v1/chat/completions accepted the request but streamed no text', [
          'The gateway and token work. The agent ended its turn without replying, so check its model and the gateway logs (`openclaw logs`).',
        ]);
        break;
      case 'provider_error':
        add('fail', "The gateway and token work, but the agent can't reach its model", [
          ...detail,
          'OpenClaw opened the reply stream, then the agent failed. The app shows no answer.',
          "Configure the agent's model provider and credentials (`openclaw configure`, or `openclaw models --help`), then rerun.",
        ]);
        break;
      case 'multi_agent':
        add('fail', 'Multi-agent gateway: model "openclaw" is rejected (HTTP 400)', [
          ...detail,
          'The gateway has more than one agent, and the app always sends model "openclaw", which names no agent.',
          'The app hides this error, so you see your words on the glasses but no answer.',
          `Fix: run the proxy (below). It rewrites the model to "openclaw/${o.agent}" and forwards everything else.`,
        ]);
        break;
      case 'unauthorized':
        add('fail', `/v1/chat/completions refused the token (HTTP ${chat.status})`, [
          ...detail,
          o.token ? 'Check that the token matches the gateway auth token or password.' : 'No token given. Pass --token or set OPENCLAW_TOKEN.',
        ]);
        break;
      case 'not_found':
        add('fail', `/v1/chat/completions not found (HTTP ${chat.status})`, [
          ...detail,
          "The gateway's OpenAI-compatible HTTP endpoint is off by default. Enable it with",
          '`openclaw config set gateway.http.endpoints.chatCompletions.enabled true` (OpenClaw applies it without a restart).',
        ]);
        break;
      default:
        add('fail', `/v1/chat/completions failed (${chat.status ? `HTTP ${chat.status}` : chat.detail})`, detail);
    }
  }

  // 4. Pending device and node requests.
  if (o.skipCli) {
    add('info', 'Approval check skipped (--no-cli)');
  } else {
    const ap = await d.pendingApprovals();
    if (ap.cliMissing) {
      add('info', '`openclaw` CLI not found on PATH', [
        'Run these on the gateway machine and approve anything pending:',
        '  openclaw devices list      →  openclaw devices approve <requestId>',
        '  openclaw nodes pending     →  openclaw nodes approve <nodeRequestId>',
      ]);
    } else {
      for (const [label, r, approve] of [
        ['device', ap.devices, 'openclaw devices approve'],
        ['node', ap.nodes, 'openclaw nodes approve'],
      ]) {
        const listCmd = r.listCmd;
        if (!r.ok) { add('warn', `\`${listCmd}\` failed`, [r.stderr.trim()]); continue; }
        if (r.ids.length) {
          add('fail', `${r.ids.length} pending ${label} request(s). Approve them yourself:`, r.ids.map((id) => `  ${approve} ${id}`));
        }
        if (r.unidentified) {
          add('fail', `${r.unidentified} pending ${label} request(s) without a recognisable ID`, [
            `Run \`${listCmd}\` yourself, then \`${approve} <requestId>\`.`,
          ]);
        }
        if (!r.ids.length && !r.unidentified) add('ok', `No pending ${label} requests`);
        // JSON output is complete and unambiguous; only the text fallback is a guess worth showing.
        const raw = r.stdout.trim();
        if (r.format === 'text' && raw) add('info', `Raw output of \`${listCmd}\` (IDs above were guessed from it)`, raw.split('\n').map((l) => `  ${l}`));
      }
    }
  }

  // 5. What to put in the MemoMind app.
  // The phone can never use a loopback address, so never suggest one.
  const isLoopback = /^(127\.|localhost$|::1$|\[::1\]$)/.test(gw.hostname);
  const host = tsReachable ? tsIp : isLoopback ? (tsIp || '<your-tailscale-or-LAN-ip>') : gw.hostname;
  const unverified = isLoopback && !tsReachable;
  const useProxy = chat?.kind === 'multi_agent';
  const proxyHost = tsIp || '<your-tailscale-or-LAN-ip>';
  const sse = useProxy
    ? `http://${proxyHost}:${o.proxyPort}/v1/chat/completions`
    : gw.hostname.endsWith('.ts.net')
      ? new URL('/v1/chat/completions', o.gateway).toString()
      : `${gw.protocol}//${host}:${port}/v1/chat/completions`;
  const ws = gw.hostname.endsWith('.ts.net')
    ? `wss://${gw.host}`
    : `ws://${host}:${port}`;
  const proxyCommand = useProxy
    ? `openclaw-doctor proxy --listen ${proxyHost} --port ${o.proxyPort} --upstream ${o.gateway} --agent ${o.agent}`
    : null;

  return { findings, sse, ws, proxyCommand, unverified, explainer: INIT_FALSE_EXPLAINER };
}

const ICON = { ok: '✔', warn: '!', fail: '✘', info: '·' };

export function renderReport(report) {
  const out = ['OpenClaw Doctor: MemoMind ⇄ OpenClaw gateway check', ''];
  for (const f of report.findings) {
    out.push(`${ICON[f.level]} ${f.title}`);
    for (const l of f.lines) if (l) out.push(`    ${l}`);
  }
  out.push('', report.explainer, '');
  out.push('MemoMind app → Memo Lab → OpenClaw:');
  out.push(`  Gateway WS URL : ${report.ws}`);
  out.push(`  SSE chat URL   : ${report.sse}`);
  out.push('  Access Token   : your gateway token (unchanged)');
  if (report.unverified) out.push('  (The phone could not reach the gateway on this address yet. Fix the ✘ items above first.)');
  if (report.proxyCommand) {
    out.push('', 'Start the proxy on the gateway machine (leave it running):', `  ${report.proxyCommand}`);
  }
  out.push('', 'This tool changed nothing. Run any approve commands above yourself.');
  return out.join('\n');
}

export function exitCode(report) {
  return report.findings.some((f) => f.level === 'fail') ? 1 : 0;
}
