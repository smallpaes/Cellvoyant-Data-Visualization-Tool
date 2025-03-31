import { useRef, useMemo, useCallback, useState } from 'react';
import './Viewport.css';

import data from '../../data/data.json';
import useViewport from '../../hooks/viewport/useViewport';
import { CustomPluginOptions, DataPoint } from '../../types/viewPort';
import { Histogram } from '../chart/histogram';
import { Toolbox } from './toolbox';
import { Tooltip } from './tooltip';
import { Skeleton } from '../skeleton';
import { DEFAULT_PLUGIN_OPTIONS } from './config';

interface ViewPortProps {
  width?: number;
  height?: number;
  /**
   * Scale factor to convert coordinates from original image space to viewport space.
   * This should be calculated as: originalImageSize / viewportSize
   * For example, if your original image is 4000x4000 and viewport is 800x800,
   * the scaleFactor would be 4000/800 = 5
   * This is used to scale x and y coordinates of data points to fit the viewport
   * Auto calculation will be done upon implementing resize feature
   */
  scaleFactor?: number;
  title?: string;
}

export const ViewPort: React.FC<ViewPortProps> = ({
  width = 800,
  height = 800,
  scaleFactor = 1,
  title,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHistogram, setShowHistogram] = useState(false);

  const updatedData = useMemo<DataPoint[]>(() => {
    {
      return (data as DataPoint[]).map(([x, y, w, h]) => [x / scaleFactor, y / scaleFactor, w, h]);
    }
  }, [scaleFactor]);

  const pluginOptions: CustomPluginOptions = useMemo(() => DEFAULT_PLUGIN_OPTIONS, []);

  const { isLoading, viewportActions, visiblePoints, tooltip } = useViewport<DataPoint[]>({
    canvasRef,
    data: updatedData,
    pluginOptions,
  });

  const areaData = useMemo(
    () => visiblePoints.map((box) => box.width * box.height),
    [visiblePoints]
  );

  const { zoomTo, centerOn, reset } = viewportActions;

  const handleZoomIn = useCallback(() => zoomTo(1.2), [zoomTo]);
  const handleZoomOut = useCallback(() => zoomTo(0.8), [zoomTo]);
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
