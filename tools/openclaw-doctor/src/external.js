// Read-only wrappers around the `openclaw` and `tailscale` CLIs.
//
// We only ever run LIST commands here. Approve commands are printed for the
// user to run themselves; this tool never approves anything.
//
// Verified against `openclaw --help` on OpenClaw 2026.11.2:
//   openclaw devices list --json   → { pending: [...], paired: [...] }
//   openclaw nodes pending --json  → [ ... ]
//   openclaw devices approve [requestId], openclaw nodes approve <requestId>
// The plain-text tables wrap long IDs across lines, so JSON is parsed first and
// the text heuristic is only a fallback for CLIs that reject --json.
import { execFile } from 'node:child_process';

/** Default runner: resolves { ok, stdout, stderr, missing } and never throws. */
export function run(cmd, args, { timeoutMs = 10000 } = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, maxBuffer: 1 << 20 }, (err, stdout, stderr) => {
      if (err && err.code === 'ENOENT') return resolve({ ok: false, missing: true, stdout: '', stderr: '' });
      resolve({ ok: !err, missing: false, stdout: String(stdout), stderr: String(stderr || err?.message || '') });
    });
  });
}

// Request IDs: UUIDs, or long-ish opaque tokens (>= 6 chars, letters+digits mixed).
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const TOKEN_RE = /\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{6,}\b/g;

/**
 * Pull candidate request IDs out of CLI output.
 * For `devices list` only lines mentioning "pending" count; for `nodes pending`
 * every line counts (the command already lists only pending requests).
 * Heuristic by design: the raw output is always shown next to it.
 */
export function extractRequestIds(output, { pendingOnly }) {
  const ids = new Set();
  for (const line of String(output).split('\n')) {
    if (pendingOnly && !/pending/i.test(line)) continue;
    if (/^\s*(id|request|name|status)\b.*\b(status|id)\b/i.test(line)) continue; // header row
    const uuids = line.match(UUID_RE);
    if (uuids) { uuids.forEach((u) => ids.add(u)); continue; }
    const tokens = (line.match(TOKEN_RE) || []).filter((t) => !/^\d{4}-?\d{2}/.test(t)); // skip dates
    if (tokens[0]) ids.add(tokens[0]);
  }
  return [...ids];
}

// The ID that `approve` takes is called requestId in the CLI help. The JSON
// field name for a *pending* entry wasn't observable (loopback clients are
// approved silently), so accept the likely names in order.
const ID_FIELDS = ['requestId', 'id', 'deviceId', 'nodeId'];
const idOf = (entry) => ID_FIELDS.map((f) => entry?.[f]).find((v) => typeof v === 'string' && v);

/**
 * Parse `--json` output. Returns { ids, unidentified } or null if it isn't the
 * expected JSON. `unidentified` counts pending entries with no recognisable ID,
 * so the doctor never reports "nothing pending" when something is.
 */
export function pendingIdsFromJson(stdout, kind) {
  let j;
  try { j = JSON.parse(stdout); } catch { return null; }
  const list = kind === 'devices' ? j?.pending : j;
  if (!Array.isArray(list)) return null;
  const ids = list.map(idOf).filter(Boolean);
  return { ids, unidentified: list.length - ids.length };
}

async function listPending(runner, args, kind) {
  let r = await runner('openclaw', [...args, '--json']);
  if (r.missing) return { missing: true };
  const parsed = r.ok ? pendingIdsFromJson(r.stdout, kind) : null;
  if (parsed) return { ...r, ...parsed, format: 'json', listCmd: `openclaw ${args.join(' ')}` };
  // Older CLI without --json (or unexpected shape): fall back to the text table.
  r = await runner('openclaw', args);
  const textIds = r.ok ? extractRequestIds(r.stdout, { pendingOnly: kind === 'devices' }) : [];
  return { ...r, ids: textIds, unidentified: 0, format: 'text', listCmd: `openclaw ${args.join(' ')}` };
}

export async function pendingApprovals(runner = run) {
  const devices = await listPending(runner, ['devices', 'list'], 'devices');
  if (devices.missing) return { cliMissing: true };
  const nodes = await listPending(runner, ['nodes', 'pending'], 'nodes');
  return { cliMissing: false, devices, nodes };
}

/**
 * Ask tailscale for this machine's IPv4 and the phones in the tailnet.
 * Resolves { missing, running, selfIp, magicDns, phones: [{ name, os, online, ip }] }.
 */
export async function tailscaleInfo(runner = run) {
  const res = await runner('tailscale', ['status', '--json']);
  if (res.missing) return { missing: true };
  if (!res.ok) return { missing: false, running: false, error: res.stderr.trim() };
  let j;
  try { j = JSON.parse(res.stdout); } catch { return { missing: false, running: false, error: 'unparseable tailscale status' }; }
  const self = j.Self || {};
  const selfIp = (self.TailscaleIPs || []).find((ip) => ip.includes('.')) || null;
  const phones = Object.values(j.Peer || {})
    .filter((p) => /^(ios|android)$/i.test(p.OS || ''))
    .map((p) => ({
      name: p.HostName,
      os: p.OS,
      online: !!p.Online,
      ip: (p.TailscaleIPs || []).find((ip) => ip.includes('.')) || null,
    }));
  return {
    missing: false,
    running: j.BackendState === 'Running',
    selfIp,
    magicDns: (self.DNSName || '').replace(/\.$/, '') || null,
    phones,
  };
}
