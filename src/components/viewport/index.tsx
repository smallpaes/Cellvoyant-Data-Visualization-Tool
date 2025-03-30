import { useRef, useMemo, useCallback, useState } from 'react';

import data from '../../data/data.json'
import useViewport from '../../hooks/viewport/useViewport';
import { PluginOptions } from '../../types/viewPort'
import { Histogram } from '../chart/histogram';

interface ViewPortProps {
  width?: number;
  height?: number;
  ratio?: number;
}

type CellType = [number, number, number, number]

export const ViewPort: React.FC<ViewPortProps> = ({
  width = 800,
  height = 800,
  ratio = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHistogram, setShowHistogram] = useState(false);

  const updatedData = useMemo(() => {{
    return (data as CellType[]).map(([x, y, w, h]) => [x / ratio, y  / ratio, w, h])
  }}, [ratio])

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
    visiblePoints,
    tooltip
  } = useViewport({ canvasRef, data: updatedData, pluginOptions });

  const areaData = useMemo(() => visiblePoints.map(box => box.width * box.height), [visiblePoints])

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
      {
        !isLoading && (
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
        )
      }
      <button 
        onClick={() => setShowHistogram(!showHistogram)}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          padding: '8px 12px',
          background: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: 4
        }}
      >
        {showHistogram ? 'Hide' : 'Show'} Distribution
      </button>
      <Histogram
        data={areaData}
        visible={showHistogram}
        onToggleVisibility={() => setShowHistogram(false)}
        title="Distribution"
        subtitle={`${visiblePoints.length} boxes visible`}
      />
    </section>
  )
};