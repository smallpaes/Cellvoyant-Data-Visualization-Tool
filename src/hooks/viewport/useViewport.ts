import { useEffect, useState, RefObject, useCallback, useMemo } from 'react';
import useOffscreenCanvas from '../useOffscreenCanvas';
import { useViewportWorker } from './useViewportWorker';
import { useViewportEvents } from './useViewportEvents';
import { useViewportActions, UseViewportActionsReturn } from './useViewportActions';
import {
  CustomPluginOptions,
  WorkerMessageType,
  ViewportInfo,
  WorkerMessage,
  TooltipData,
  VisiblePoint,
  RenderedData,
} from '../../types/viewPort';

interface UseViewportProps<T> {
  screenWidth?: number;
  screenHeight?: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  renderedData: T;
  pluginOptions?: CustomPluginOptions;
}

interface ViewportHookReturn {
  viewportActions: UseViewportActionsReturn;
  isLoading: boolean;
  viewportInfo: ViewportInfo | null;
  error: Error | null;
  tooltip: {
    isVisible: boolean;
    data: TooltipData | null;
  };
  visiblePoints: VisiblePoint[];
}

const useViewport = <T extends RenderedData>({
  screenWidth,
  screenHeight,
  canvasRef,
  renderedData,
  pluginOptions,
}: UseViewportProps<T>): ViewportHookReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const view = useOffscreenCanvas(canvasRef);
  const [visiblePoints, setVisiblePoints] = useState<VisiblePoint[]>([]);

  const handleWorkerMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    switch (message.type) {
      case WorkerMessageType.VIEWPORT_UPDATE:
        setViewportInfo(message.data);
        break;
      case WorkerMessageType.INIT_COMPLETE:
        setIsInitialized(true);
        setViewportInfo(message.data);
        break;
      case WorkerMessageType.TOOLTIP_UPDATE:
        setShowTooltip(message.data !== null);
        setTooltipData(message.data);
        break;
      case WorkerMessageType.INITIAL_RENDER_COMPLETE:
        setIsLoading(false);
        break;
      case WorkerMessageType.VISIBLE_POINTS_UPDATE:
        setVisiblePoints(message.data);
        break;
      default:
        break;
    }
  }, []);

  const { initWorker, terminateWorker, postMessage, workerRef } = useViewportWorker({
    onMessage: handleWorkerMessage,
    onError: setError,
  });

  const initViewport = useCallback(() => {
    if (!workerRef.current || !view || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const { width, height } = canvas;

    postMessage(
      {
        type: WorkerMessageType.INIT,
        data: {
          canvas: view,
          imagePath: '/images/cell.jpg',
          renderedData,
          viewport: {
            screenWidth: screenWidth || width,
            screenHeight: screenHeight || height,
            worldWidth: width,
            worldHeight: height,
            plugins: pluginOptions || {},
          },
        },
      },
      view
    );
  }, [
    view,
    canvasRef,
    renderedData,
    pluginOptions,
    workerRef,
    postMessage,
    screenWidth,
    screenHeight,
  ]);

  useEffect(() => {
    if (!canvasRef.current || !view) return;
    const worker = initWorker();
    if (worker) initViewport();
    return () => terminateWorker();
  }, [view, canvasRef, initWorker, initViewport, terminateWorker]);

  useViewportEvents({
    canvasRef,
    postMessage,
    isInitialized,
  });

  const tooltip = useMemo(
    () => ({
      isVisible: showTooltip,
      data: tooltipData,
    }),
    [showTooltip, tooltipData]
  );

  const viewportActions = useViewportActions(isInitialized, postMessage);

  return {
    viewportActions,
    viewportInfo,
    visiblePoints,
    tooltip,
    isLoading,
    error,
  };
};

export default useViewport;
