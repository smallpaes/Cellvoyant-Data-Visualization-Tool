import { useEffect, useState, RefObject, useCallback } from 'react';
import useOffscreenCanvas from './useOffscreenCanvas';
import { useViewportWorker } from './useViewportWorker';
import { useViewportEvents } from './useViewportEvents';
import { useViewportActions, UseViewportActionsReturn } from './useViewportActions';
import { PluginOptions, WorkerMessageType, ViewportInfo, WorkerMessage } from '../../types/viewPort'

type UseViewportProps<T> = {
  canvasRef: RefObject<HTMLCanvasElement | null>,
  data: T
  pluginOptions?: PluginOptions
}

type ViewportHookReturn = {
  viewportActions: UseViewportActionsReturn;
  isLoading: boolean;
  viewportInfo: ViewportInfo;
  error: Error | null;
}

const useViewport = <T>({ 
  canvasRef, 
  data, 
  pluginOptions = {}
}: UseViewportProps<T>): ViewportHookReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({ scale: 1, x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const view = useOffscreenCanvas(canvasRef);

  const handleWorkerMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
    const { type, data } = event.data;
    switch (type) {
      case WorkerMessageType.VIEWPORT_UPDATE:
        setViewportInfo(data);
        setIsLoading(false);
        break;
      case WorkerMessageType.INIT_COMPLETE:
        setIsInitialized(true);
        setViewportInfo(data);
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
    const resolution = window.devicePixelRatio;
    postMessage({
      type: WorkerMessageType.INIT,
      canvas: view,
      resolution,
      imagePath: '/images/cell.jpg',
      renderedData: {
        data,
        size: 1
      },
      viewport: {
        screenWidth: width,
        screenHeight: height,
        worldWidth: width,
        worldHeight: height,
        plugins: pluginOptions
      }
    }, view);
  }, [view, canvasRef, data, pluginOptions, workerRef, postMessage]);

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

  const viewportActions = useViewportActions(isInitialized, postMessage);

  return {
    viewportActions,
    viewportInfo,
    isLoading,
    error
  };
};

export default useViewport;