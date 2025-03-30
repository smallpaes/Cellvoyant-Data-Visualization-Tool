import { useEffect, useState, RefObject, useCallback, useMemo } from 'react';
import useOffscreenCanvas from '../useOffscreenCanvas';
import { useViewportWorker } from './useViewportWorker';
import { useViewportEvents } from './useViewportEvents';
import { useViewportActions, UseViewportActionsReturn } from './useViewportActions';
import { PluginOptions, WorkerMessageType, ViewportInfo, WorkerMessage, TooltipData, VisiblePoint } from '../../types/viewPort';

type UseViewportProps<T> = {
  screenWidth?: number;
  screenHeight?: number;
  canvasRef: RefObject<HTMLCanvasElement | null>,
  data: T
  pluginOptions?: PluginOptions
}

type ViewportHookReturn = {
  viewportActions: UseViewportActionsReturn;
  isLoading: boolean;
  viewportInfo: ViewportInfo;
  error: Error | null;
  tooltip: {
    isVisible: boolean;
    data: TooltipData | null;
  }
  visiblePoints: VisiblePoint[];
}

const useViewport = <T>({ 
  screenWidth,
  screenHeight,
  canvasRef, 
  data, 
  pluginOptions
}: UseViewportProps<T>): ViewportHookReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({ scale: 1, x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const view = useOffscreenCanvas(canvasRef);
  const [visiblePoints, setVisiblePoints] = useState<VisiblePoint[]>([]);

  const handleWorkerMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
    const { type, data } = event.data;
    switch (type) {
      case WorkerMessageType.VIEWPORT_UPDATE:
        setViewportInfo(data);
        break;
      case WorkerMessageType.INIT_COMPLETE:
        setIsInitialized(true);
        setViewportInfo(data);
        break;
      case WorkerMessageType.TOOLTIP_UPDATE:
        setShowTooltip(data !== null);
        setTooltipData(data);
        break;
      case WorkerMessageType.INITIAL_RENDER_COMPLETE:
        setIsLoading(false);
        break;
      case WorkerMessageType.VISIBLE_POINTS_UPDATE:
        setVisiblePoints(data);
        break;
      default:
        break;
    }
  }, []);

  const { initWorker, terminateWorker, postMessage, workerRef } = useViewportWorker({
    onMessage: handleWorkerMessage,
    onError: setError
  });

  const initViewport = useCallback(() => {
    if (!workerRef.current || !view || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const { width, height } = canvas;

    postMessage({
      type: WorkerMessageType.INIT,
      canvas: view,
      imagePath: '/images/cell.jpg',
      renderedData: {
        data,
        size: 1
      },
      viewport: {
        screenWidth: screenWidth || width,
        screenHeight: screenHeight || height,
        worldWidth: width,
        worldHeight: height,
        plugins: pluginOptions || {}
      }
    }, view);
  }, [view, canvasRef, data, pluginOptions, workerRef, postMessage, screenWidth, screenHeight]);

  useEffect(() => {
    if (!canvasRef.current || !view) return;
    const worker = initWorker();
    if (worker) initViewport();
    return () => terminateWorker();
  }, [view, canvasRef, initWorker, initViewport, terminateWorker]);

  useViewportEvents({
    canvasRef,
    postMessage,
    isInitialized
  });

  const tooltip = useMemo(() => ({
    isVisible: showTooltip,
    data: tooltipData
  }), [showTooltip, tooltipData]);

  const viewportActions = useViewportActions(isInitialized, postMessage);

  return {
    viewportActions,
    viewportInfo,
    visiblePoints,
    tooltip,
    isLoading,
    error
  };
};

export default useViewport;