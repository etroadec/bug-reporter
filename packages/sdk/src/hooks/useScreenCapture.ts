import { useCallback } from 'react';
import { captureRef } from 'react-native-view-shot';
import { createClient } from '@supabase/supabase-js';
import { useBugReporter } from './useBugReporter';
import { SCREENSHOT_QUALITY, SCREENSHOT_FORMAT } from '../constants';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

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

export function useScreenCapture() {
  const { viewRef, config } = useBugReporter();

  const captureAndUpload = useCallback(async (): Promise<{ uri: string; url: string } | null> => {
    try {
      if (!viewRef.current) return null;

      // Capture as both URI (for preview) and base64 (for upload)
      const uri = await captureRef(viewRef.current, {
        format: SCREENSHOT_FORMAT,
        quality: SCREENSHOT_QUALITY,
      });

      const base64 = await captureRef(viewRef.current, {
        format: SCREENSHOT_FORMAT,
        quality: SCREENSHOT_QUALITY,
        result: 'base64',
      });

      // Upload base64 decoded to Supabase Storage
      const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const fileName = `${config.projectId}/${uniqueId}.jpg`;

      const arrayBuffer = base64ToArrayBuffer(base64);

      const { error } = await supabase.storage
        .from('screenshots')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

      if (error) {
        // Upload failed, still return URI for preview but no remote URL
        return { uri, url: '' };
      }

      const { data } = supabase.storage.from('screenshots').getPublicUrl(fileName);
      return { uri, url: data.publicUrl };
    } catch {
      return null;
    }
  }, [viewRef, config]);

  return { captureAndUpload };
}
