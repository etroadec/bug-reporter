import { useCallback } from 'react';
import { captureScreen } from 'react-native-view-shot';
import { createClient } from '@supabase/supabase-js';
import { useBugReporter } from './useBugReporter';
import { SCREENSHOT_QUALITY, SCREENSHOT_FORMAT } from '../constants';
import { base64ToArrayBuffer } from '../utils/base64';

export function useScreenCapture() {
  const { config } = useBugReporter();

  const captureAndUpload = useCallback(async (): Promise<{ uri: string; url: string } | null> => {
    try {
      // Use captureScreen to capture the actual displayed screen pixels
      // instead of captureRef which captures the view hierarchy and can
      // show the wrong screen in stack navigators
      const uri = await captureScreen({
        format: SCREENSHOT_FORMAT,
        quality: SCREENSHOT_QUALITY,
      });

      const base64 = await captureScreen({
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
  }, [config]);

  return { captureAndUpload };
}
