import { useRef, useCallback } from 'react';
import { WorkerMessage } from '../types/viewPort';

interface UseViewportWorkerProps {
  onMessage: (event: MessageEvent<WorkerMessage>) => void;
  onError: (error: Error) => void;
}

export const useViewportWorker = ({ onMessage, onError }: UseViewportWorkerProps) => {
  const workerRef = useRef<Worker | null>(null);

  const initWorker = useCallback(() => {
    try {
      const worker = new Worker(new URL('../workers/viewport/viewportWorker.js', import.meta.url), {
        type: 'module'
      });
      workerRef.current = worker;
      worker.addEventListener('message', onMessage);
      return worker;
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to initialize worker'));
      return null;
    }
  }, [onMessage, onError]);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.removeEventListener('message', onMessage);
      workerRef.current.terminate();
    }
  }, [onMessage]);

  const postMessage = useCallback((message: WorkerMessage, canvas?: OffscreenCanvas) => {
    if (canvas) {
      workerRef.current?.postMessage(message, [canvas]);
    } else {
      workerRef.current?.postMessage(message);
    }
  }, []);

  return {
    workerRef,
    initWorker,
    terminateWorker,
    postMessage
  };
}; 