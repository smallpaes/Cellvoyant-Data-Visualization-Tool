import { useCallback, useEffect, useRef } from 'react';
import { RefObject } from 'react';
import { WorkerMessageType, WorkerMessage } from '../../types/viewPort';
import { throttle } from '../../utils/throttle';

interface UseViewportEventsProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  postMessage: (message: WorkerMessage) => void;
  isInitialized: boolean;
}

export const useViewportEvents = ({ canvasRef, postMessage, isInitialized }: UseViewportEventsProps) => {
  const rectRef = useRef<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (canvasRef.current) {
      rectRef.current = canvasRef.current.getBoundingClientRect();
    }
  }, [canvasRef]);

  const throttledUpdateRect = useCallback(
    () => throttle(updateRect, 100)(),
    [updateRect]
  );

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !rectRef.current) return;
    
    const canvasX = e.clientX - rectRef.current.left;
    const canvasY = e.clientY - rectRef.current.top;
        
    postMessage({
      type: WorkerMessageType.WHEEL,
      deltaY: e.deltaY,
      deltaMode: e.deltaMode,
      canvasX,
      canvasY
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
    if (!canvasRef.current || !rectRef.current) return;

    const canvasX = e.clientX - rectRef.current.left;
    const canvasY = e.clientY - rectRef.current.top;

    const isOutsideCanvas = canvasX < 0 || canvasX > rectRef.current.width || canvasY < 0 || canvasY > rectRef.current.height;

    if (isOutsideCanvas) {
      postMessage({ type: WorkerMessageType.MOUSE_LEAVE });
      return;
    }

    postMessage({
      type: WorkerMessageType.MOUSE_MOVE,
      clientX: e.clientX,
      clientY: e.clientY,
      canvasX: isOutsideCanvas ? -1 : canvasX,
      canvasY: isOutsideCanvas ? -1 : canvasY
    });
  }, [postMessage, canvasRef]);

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

    updateRect();

    window.addEventListener('resize', throttledUpdateRect);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', throttledUpdateRect);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isInitialized, canvasRef, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, updateRect, throttledUpdateRect]);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}; 