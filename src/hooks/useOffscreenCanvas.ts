import { useEffect, useRef, useState, RefObject } from 'react';

const useOffscreenCanvas = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
  const [view, setView] = useState<OffscreenCanvas | null>(null);
  const hasTransferred = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || hasTransferred.current || view) return;
    const offscreenCanvas = canvasRef.current.transferControlToOffscreen();
    setView(offscreenCanvas);
    hasTransferred.current = true;
  }, [canvasRef, view]);

  return view;
};

export default useOffscreenCanvas;
