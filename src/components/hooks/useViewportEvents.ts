import { useCallback, useEffect } from 'react';
import { RefObject } from 'react';
import { WorkerMessageType, WorkerMessage } from '../../types/viewPort';

interface UseViewportEventsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  postMessage: (message: WorkerMessage) => void;
  isInitialized: boolean;
}

export const useViewportEvents = ({ canvasRef, postMessage, isInitialized }: UseViewportEventsProps) => {
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
        
    postMessage({
      type: WorkerMessageType.WHEEL,
      deltaY: e.deltaY,
      deltaMode: e.deltaMode,
      clientX: x,
      clientY: y
    });
  }, [canvasRef, postMessage]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    postMessage({
      type: WorkerMessageType.MOUSE_DOWN,
      button: e.button,
      clientX: e.clientX,
      clientY: e.clientY
    });
  }, [postMessage]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    postMessage({
      type: WorkerMessageType.MOUSE_MOVE,
      clientX: e.clientX,
      clientY: e.clientY
    });
  }, [postMessage]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    postMessage({
      type: WorkerMessageType.MOUSE_UP,
      button: e.button,
      clientX: e.clientX,
      clientY: e.clientY
    });
  }, [postMessage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isInitialized, canvasRef, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}; 