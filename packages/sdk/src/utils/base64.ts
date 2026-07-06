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
    // In the final group, padding chars were stripped, so clean[i+2]/clean[i+3]
    // may be missing. Treat missing sextets as 0 bits — using indexOf's -1 here
    // would OR every bit to 1 and corrupt the last 1-2 bytes (JPEG EOI marker).
    const a = chars.indexOf(clean[i]);
    const b = chars.indexOf(clean[i + 1]);
    const c = i + 2 < len ? chars.indexOf(clean[i + 2]) : 0;
    const d = i + 3 < len ? chars.indexOf(clean[i + 3]) : 0;
    const bits = (a << 18) | (b << 12) | (c << 6) | d;
    bytes[p++] = (bits >> 16) & 0xff;
    if (p < byteLen) bytes[p++] = (bits >> 8) & 0xff;
    if (p < byteLen) bytes[p++] = bits & 0xff;
  }

  return buffer;
}
