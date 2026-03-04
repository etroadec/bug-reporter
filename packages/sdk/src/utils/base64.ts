const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Count padding from the original string before stripping
  let padding = 0;
  if (base64.endsWith('==')) padding = 2;
  else if (base64.endsWith('=')) padding = 1;

  // Remove all non-base64 characters (including '=' padding)
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;

  // The byte length formula requires the padded base64 length (multiple of 4).
  // Since clean has '=' stripped, we add padding back for the calculation.
  const paddedLen = len + padding;
  const byteLen = (paddedLen * 3) / 4 - padding;
  const buffer = new ArrayBuffer(byteLen);
  const bytes = new Uint8Array(buffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const a = chars.indexOf(clean[i]);
    const b = chars.indexOf(clean[i + 1]);
    const c = chars.indexOf(clean[i + 2]);
    const d = chars.indexOf(clean[i + 3]);
    const bits = (a << 18) | (b << 12) | (c << 6) | d;
    bytes[p++] = (bits >> 16) & 0xff;
    if (p < byteLen) bytes[p++] = (bits >> 8) & 0xff;
    if (p < byteLen) bytes[p++] = bits & 0xff;
  }

  return buffer;
}
