import { useMemo } from 'react';
import { useBugReporter } from './useBugReporter';

export function useFeatureBoard() {
  const { config, openBoard, closeBoard, isBoardVisible } = useBugReporter();

  const boardUrl = useMemo(() => {
    if (!config.featureBoard) return null;
    const base = config.featureBoard.boardBaseUrl.replace(/\/$/, '');
    const url = `${base}/${config.projectId}`;
    return config.userId ? `${url}?voter_id=${encodeURIComponent(config.userId)}` : url;
  }, [config.featureBoard, config.projectId, config.userId]);

  return { boardUrl, openFeatureBoard: openBoard, closeFeatureBoard: closeBoard, isBoardVisible };
}
