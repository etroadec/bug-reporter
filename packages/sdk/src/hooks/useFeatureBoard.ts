import { useMemo } from 'react';
import { useBugReporter } from './useBugReporter';
import { toOpaqueId } from '../utils/opaqueId';

export function useFeatureBoard() {
  const { config, openBoard, closeBoard, isBoardVisible } = useBugReporter();

  const boardUrl = useMemo(() => {
    if (!config.featureBoard) return null;
    const base = config.featureBoard.boardBaseUrl.replace(/\/$/, '');
    const url = `${base}/${config.projectId}`;
    // Pass an opaque voter token, never the raw identifier, in the WebView URL.
    const voterId = toOpaqueId(config.userId);
    return voterId ? `${url}?voter_id=${encodeURIComponent(voterId)}` : url;
  }, [config.featureBoard, config.projectId, config.userId]);

  return { boardUrl, openFeatureBoard: openBoard, closeFeatureBoard: closeBoard, isBoardVisible };
}
