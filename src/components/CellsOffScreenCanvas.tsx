import { useEffect, useState, useRef, useMemo } from 'react';
import data from '../data/data.json'


interface CellsOffScreenCanvasProps {
  width?: number;
  height?: number;
}

type CellType = [number, number, number, number]

export const CellsOffScreenCanvas: React.FC<CellsOffScreenCanvasProps> = ({
  width = 800,
  height = 400,
}) => {
  const [view, setView] = useState<OffscreenCanvas | null>(null);
  const hasTransferred = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updatedData = useMemo(() => {{
    return (data as CellType[]).map(([x, y, w, h]) => [x / 8, y  / 8, w, h])
  }}, [])

  useEffect(() => {{
    if (!canvasRef.current || hasTransferred.current || view) return;
    const offscreenCanvas = canvasRef.current.transferControlToOffscreen();
    setView(offscreenCanvas);
    hasTransferred.current = true;
  }}, [view]);

  useEffect(() => {{
    if (!canvasRef.current || !view) return;
    const { width, height } = canvasRef.current;
    const resolution = window.devicePixelRatio;
    const worker = new Worker(new URL('../workers/renderImage.js', import.meta.url), {
      type: 'module'
    });
    worker.postMessage({ 
      width,
      height,
      resolution,
      view,
      imagePath: '/images/cell.jpg',
      data: updatedData
    }, [view]);
    worker.onmessage = (event) => {
      console.log('done', event.data);
      if (event.data.type === 'RENDERED') {
        setIsLoading(false);
      }
    };
    return () => {
      worker.terminate();
    }
  }}, [view, updatedData]);

  return (
    <>
      <canvas ref={canvasRef} width={width} height={height} />
      {isLoading && <div>Loading...</div>}
    </>
  )
}; 