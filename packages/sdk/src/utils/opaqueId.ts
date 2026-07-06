/**
 * De-identify a user identifier before it leaves the device.
 *
 * The host app supplies `config.userId`, which has historically been an email.
 * To avoid transmitting raw PII (over the network, in WebView URLs, in server
 * logs), we hash it into a stable opaque token. The value is deterministic, so
 * the same user keeps the same token (reports and votes stay groupable), but it
 * is not reversible to the original identifier.
 *
 * This is de-identification, not encryption: like any hash of a low-entropy
 * value it is not brute-force proof, so it complements — never replaces — the
 * server-side controls (RLS, pseudonymization trigger).
 */
export function toOpaqueId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  // Two FNV-1a passes with different offsets give a 64-bit-wide token.
  const h1 = fnv1a(normalized, 0x811c9dc5);
  const h2 = fnv1a(normalized, 0x1b873593);
  return (
    'u_' +
    h1.toString(16).padStart(8, '0') +
    h2.toString(16).padStart(8, '0')
  );
}

function fnv1a(str: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
