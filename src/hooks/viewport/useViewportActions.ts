import { useCallback } from 'react';

import { WorkerMessageType, WorkerMessage } from '../../types/viewPort';

export type UseViewportActionsReturn = {
  zoomTo: (scale: number, centerX?: number, centerY?: number) => void;
  centerOn: (x: number, y: number) => void;
  reset: () => void;
};

export const useViewportActions = (
  isInitialized: boolean,
  postMessage: (message: WorkerMessage, canvas?: OffscreenCanvas) => void
): UseViewportActionsReturn => {
  const zoomTo = useCallback(
    (scale: number, centerX?: number, centerY?: number) => {
      if (!isInitialized) return;
      postMessage({
        type: WorkerMessageType.ZOOM,
        data: {
          scale,
          center:
            centerX !== undefined && centerY !== undefined ? { x: centerX, y: centerY } : undefined,
        },
      });
    },
    [isInitialized, postMessage]
  );

  const centerOn = useCallback(
    (x: number, y: number) => {
      if (!isInitialized) return;
      postMessage({
        type: WorkerMessageType.CENTER,
        data: { point: { x, y } },
      });
    },
    [isInitialized, postMessage]
  );

  const reset = useCallback(() => {
    if (!isInitialized) return;
    postMessage({
      type: WorkerMessageType.RESET,
    });
  }, [isInitialized, postMessage]);

  return { zoomTo, centerOn, reset };
};
