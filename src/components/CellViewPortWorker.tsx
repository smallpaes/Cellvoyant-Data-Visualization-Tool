import { useRef, useMemo, useCallback } from 'react';
import data from '../data/data.json'

import useViewport from './hooks/useViewport';

import { PluginOptions } from '../types/viewPort'


interface CellViewPortOffScreenCanvasProps {
  width?: number;
  height?: number;
}

type CellType = [number, number, number, number]

export const CellViewPortOffScreenCanvas: React.FC<CellViewPortOffScreenCanvasProps> = ({
  width = 800,
  height = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updatedData = useMemo(() => {{
    return (data as CellType[]).map(([x, y, w, h]) => [x / 8, y  / 8, w, h])
  }}, [])

  const pluginOptions: PluginOptions = useMemo(() => ({
    clampZoom: {
      minScale: 1,
      maxScale: 15
    },    
    clamp: {
      direction: 'all',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      underflow: 'center'
    },
    wheel: {
      percent: 0.1
    },
    drag: {
      direction: 'all'
    },
    tooltip: {
      enabled: true
    }
  }), [])

  const {
    isLoading,
    viewportActions,
    viewportInfo,
    tooltip
  } = useViewport({ canvasRef, data: updatedData, pluginOptions });

  const { zoomTo, centerOn, reset } = viewportActions;

  const handleZoomIn = useCallback(() => zoomTo(1.2), [zoomTo]);
  const handleZoomOut = useCallback(() => zoomTo(0.8), [zoomTo]);
  const handleCenter = useCallback(() => centerOn(width / 2, height / 2), [centerOn, width, height]);
  const handleReset = useCallback(() => reset(), [reset]);

  return (
    <section style={{
      position: 'relative',
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
      {isLoading && <div>Loading...</div>}
      {tooltip.isVisible && <div
        style={{
          position: 'absolute',
          top: tooltip.data?.y || 0 + 100,
          left: tooltip.data?.x || 0 + 100,
          backgroundColor: 'white',
          border: '1px solid black',
          padding: '10px',
          borderRadius: '5px',
          color: 'black',
          textAlign: 'left',
          minWidth: 'fit-content',
          pointerEvents: 'none'
        }}
      >
        <div>x: {tooltip.data?.x.toFixed(2)}</div>  
        <div>y: {tooltip.data?.y.toFixed(2)}</div>
        <div>width: {tooltip.data?.width.toFixed(2)}</div>
        <div>height: {tooltip.data?.height.toFixed(2)}</div>
      </div>}
      <div>Scale: {viewportInfo.scale ? viewportInfo.scale.toFixed(2) : "1.00"}</div>
      <div>Position: X={viewportInfo.x ? viewportInfo.x.toFixed(0) : "0"}, Y={viewportInfo.y ? viewportInfo.y.toFixed(0) : "0"}</div>
      <div>World Size: {width}x{height}</div>
      <div className="controls" style={{
        position: 'absolute',
        bottom: '50%',
        left: '100%',
        transform: 'translateY(-50%)'
      }}>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleCenter}>Center</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </section>
  )
};