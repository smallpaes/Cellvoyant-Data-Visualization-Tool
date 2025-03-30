import { useRef, useMemo, useCallback, useState } from 'react';
import './Viewport.css';

import data from '../../data/data.json'
import useViewport from '../../hooks/viewport/useViewport';
import { PluginOptions } from '../../types/viewPort'
import { Histogram } from '../chart/histogram';
import { Toolbox } from './toolbox';
import { Tooltip } from './tooltip';
import { Skeleton } from '../skeleton';

interface ViewPortProps {
  width?: number;
  height?: number;
  ratio?: number;
  title?: string;
}

type CellType = [number, number, number, number]

export const ViewPort: React.FC<ViewPortProps> = ({
  width = 800,
  height = 800,
  ratio = 1,
  title
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
    <section className="viewport">
      <h2 className="viewport__title">{title}</h2>
      <div className="viewport__content">
        <canvas ref={canvasRef} width={width} height={height} className="viewport__canvas" />
        {isLoading && <Skeleton width={width} height={height} className="viewport__skeleton" />}
        <Toolbox
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenter={handleCenter}
          onReset={handleReset}
          onToggleHistogram={() => setShowHistogram(!showHistogram)}
          isHistogramVisible={showHistogram}
          isDisabled={isLoading}
        />
        <Tooltip isVisible={tooltip.isVisible} data={tooltip.data} />
        <Histogram
          data={areaData}
          visible={showHistogram}
          onToggleVisibility={() => setShowHistogram(false)}
          title="Distribution"
          subtitle={`${visiblePoints.length} boxes visible`}
        />
      </div>
    </section>
  )
};