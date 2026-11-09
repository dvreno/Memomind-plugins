// Helpers that keep secrets out of anything we print.

const SECRET_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-openclaw-token',
]);

/** Replace a secret with a short, non-reversible hint ("abcd…(32 chars)" is too much; we show only length). */
export function maskSecret(value) {
  if (!value) return '(none)';
  return `(set, ${String(value).length} chars)`;
}

/** Copy of headers with secret-bearing ones masked. Safe to log. */
export function redactHeaders(headers = {}) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = SECRET_HEADERS.has(k.toLowerCase()) ? '[redacted]' : v;
  }
  return out;
}

/** Remove any occurrence of the given secrets from free text (e.g. CLI output or error bodies). */
export function scrub(text, secrets = []) {
  let s = String(text ?? '');
  for (const secret of secrets) {
    if (secret && secret.length >= 4) s = s.split(secret).join('[redacted]');
  }
  // Bearer tokens that slipped into text.
  return s.replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi, '$1[redacted]');
}
