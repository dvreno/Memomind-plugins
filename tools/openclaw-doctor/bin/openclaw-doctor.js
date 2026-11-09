#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { runDoctor, renderReport, exitCode, DEFAULTS } from '../src/doctor.js';
import { startProxy } from '../src/proxy.js';
import { maskSecret } from '../src/redact.js';

const HELP = `openclaw-doctor: get MemoMind glasses talking to your OpenClaw gateway

Usage:
  openclaw-doctor doctor [options]   Read-only checks; prints the fix and app settings
  openclaw-doctor proxy  [options]   Model-rewriting pass-through for multi-agent gateways

doctor options:
  --gateway <url>        Gateway base URL (default ${DEFAULTS.gateway})
  --tailscale-ip <ip>    Tailscale IP to test (default: auto from \`tailscale status\`)
  --token <token>        Gateway token (or env OPENCLAW_TOKEN). Never printed.
  --agent <id>           Agent the proxy should target (default ${DEFAULTS.agent})
  --proxy-port <n>       Port suggested for the proxy (default ${DEFAULTS.proxyPort})
  --no-chat              Skip the /v1/chat/completions check
  --no-cli               Skip running \`openclaw devices list\` / \`openclaw nodes pending\`
  --no-tailscale         Skip the Tailscale lookup

proxy options:
  --listen <ip>          REQUIRED. Your Tailscale (100.x) or LAN IP. 0.0.0.0 is refused.
  --port <n>             Listen port (default ${DEFAULTS.proxyPort})
  --upstream <url>       Gateway base URL (default ${DEFAULTS.gateway})
  --agent <id>           Rewrite model "openclaw" → "openclaw/<id>" (default ${DEFAULTS.agent})
  --allow-all-interfaces Allow --listen 0.0.0.0 (not recommended)
`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    gateway: { type: 'string' },
    'tailscale-ip': { type: 'string' },
    token: { type: 'string' },
    agent: { type: 'string' },
    'proxy-port': { type: 'string' },
    'no-chat': { type: 'boolean' },
    'no-cli': { type: 'boolean' },
    'no-tailscale': { type: 'boolean' },
    listen: { type: 'string' },
    port: { type: 'string' },
    upstream: { type: 'string' },
    'allow-all-interfaces': { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

const cmd = positionals[0];

if (values.help || !cmd || cmd === 'help') {
  process.stdout.write(HELP);
  process.exit(cmd || values.help ? 0 : 1);
}

if (cmd === 'doctor') {
  const token = values.token || process.env.OPENCLAW_TOKEN || '';
  if (token) console.log(`Token: ${maskSecret(token)}\n`);
  const report = await runDoctor({
    gateway: values.gateway || DEFAULTS.gateway,
    tailscaleIp: values['tailscale-ip'],
    token,
    agent: values.agent || DEFAULTS.agent,
    proxyPort: Number(values['proxy-port'] || DEFAULTS.proxyPort),
    skipChat: values['no-chat'],
    skipCli: values['no-cli'],
    skipTailscale: values['no-tailscale'],
  });
  console.log(renderReport(report));
  process.exit(exitCode(report));
} else if (cmd === 'proxy') {
  const opts = {
    listen: values.listen,
    port: Number(values.port || DEFAULTS.proxyPort),
    upstream: values.upstream || DEFAULTS.gateway,
    agent: values.agent || DEFAULTS.agent,
    allowAllInterfaces: values['allow-all-interfaces'],
  };
  try {
    await startProxy(opts);
  } catch (e) {
    console.error(`openclaw-doctor proxy: ${e.message}`);
    process.exit(2);
  }
  console.log(`Proxy listening on http://${opts.listen}:${opts.port}/v1/ → ${opts.upstream} (model "openclaw" → "openclaw/${opts.agent}")`);
  console.log(`Set the MemoMind SSE chat URL to http://${opts.listen}:${opts.port}/v1/chat/completions`);
  console.log('Logging method, path, status and timing only. Headers and bodies are never logged.');
} else {
  console.error(`Unknown command "${cmd}".\n`);
  process.stdout.write(HELP);
  process.exit(1);
}
