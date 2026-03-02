import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { useBugReporter } from './useBugReporter';

export function useFeatureBoard() {
  const { config } = useBugReporter();

  const boardUrl = useMemo(() => {
    if (!config.featureBoard) return null;
    const base = config.featureBoard.boardBaseUrl.replace(/\/$/, '');
    const url = `${base}/${config.projectId}`;
    return config.userId ? `${url}?voter_id=${encodeURIComponent(config.userId)}` : url;
  }, [config.featureBoard, config.projectId, config.userId]);

  const openFeatureBoard = useCallback(() => {
    if (boardUrl) {
      Linking.openURL(boardUrl);
    }
  }, [boardUrl]);

  return { boardUrl, openFeatureBoard };
}
