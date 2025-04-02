import { useRef, useMemo, useCallback, useState } from 'react';
import './Viewport.css';

import data from '../../data/data.json';
import useViewport from '../../hooks/viewport/useViewport';
import { CustomPluginOptions, DataPoint, RenderedData } from '../../types/viewPort';
import { Histogram } from '../chart/histogram';
import { Toolbox } from './toolbox';
import { Tooltip } from './tooltip';
import { Skeleton } from '../skeleton';
import {
  DEFAULT_BRUSH_SIZE,
  DEFAULT_PLUGIN_OPTIONS,
  DEFAULT_ZOOM_IN_SCALE,
  DEFAULT_ZOOM_OUT_SCALE,
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
} from './config';

interface ViewPortProps {
  width?: number;
  height?: number;
  imageWidth: number;
  imageHeight: number;
  title?: string;
}

export const ViewPort: React.FC<ViewPortProps> = ({
  width = DEFAULT_VIEWPORT_WIDTH,
  height = DEFAULT_VIEWPORT_HEIGHT,
  imageWidth,
  title,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHistogram, setShowHistogram] = useState(false);

  const renderedData = useMemo<RenderedData>(() => {
    return {
      data: data as DataPoint[],
      brushSize: DEFAULT_BRUSH_SIZE,
      scaleFactor: width / imageWidth,
    };
  }, [imageWidth, width]);

  const pluginOptions: CustomPluginOptions = useMemo(() => DEFAULT_PLUGIN_OPTIONS, []);

  const { isLoading, viewportActions, visiblePoints, tooltip } = useViewport<RenderedData>({
    canvasRef,
    renderedData,
    pluginOptions,
  });

  const areaData = useMemo(
    () => visiblePoints.map((box) => box.width * box.height),
    [visiblePoints]
  );

  const { zoomTo, centerOn, reset } = viewportActions;

  const handleZoomIn = useCallback(() => zoomTo(DEFAULT_ZOOM_IN_SCALE), [zoomTo]);
  const handleZoomOut = useCallback(() => zoomTo(DEFAULT_ZOOM_OUT_SCALE), [zoomTo]);
  const handleCenter = useCallback(
    () => centerOn(width / 2, height / 2),
    [centerOn, width, height]
  );
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
          title="Size Distribution"
          subtitle={`${visiblePoints.length} boxes visible`}
        />
      </div>
    </section>
  );
};
