import { useCallback } from 'react';
import { captureRef } from 'react-native-view-shot';
import { createClient } from '@supabase/supabase-js';
import { useBugReporter } from './useBugReporter';
import { SCREENSHOT_QUALITY, SCREENSHOT_FORMAT } from '../constants';

export function useScreenCapture() {
  const { viewRef, config } = useBugReporter();

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      if (!viewRef.current) return null;

      const uri = await captureRef(viewRef.current, {
        format: SCREENSHOT_FORMAT,
        quality: SCREENSHOT_QUALITY,
      });

      return uri;
    } catch {
      return null;
    }
  }, [viewRef, config]);

  const uploadScreenshot = useCallback(
    async (uri: string): Promise<string | null> => {
      try {
        const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
        const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const fileName = `${config.projectId}/${uniqueId}.jpg`;

        // React Native: use FormData with file URI (fetch blob doesn't work reliably)
        const formData = new FormData();
        formData.append('', {
          uri,
          name: `${uniqueId}.jpg`,
          type: 'image/jpeg',
        } as unknown as Blob);

        const { error } = await supabase.storage
          .from('screenshots')
          .upload(fileName, formData, { contentType: 'multipart/form-data' });

        if (error) return null;

        const { data } = supabase.storage.from('screenshots').getPublicUrl(fileName);
        return data.publicUrl;
      } catch {
        return null;
      }
    },
    [config]
  );

  return { captureScreenshot, uploadScreenshot };
}
