import React, { useEffect, useRef, useState } from 'react';
import { plot, rectY, binX, ruleY, PlotOptions } from '@observablehq/plot';
import { BASE_CHART_CONFIG } from './config';

import './Histogram.css';

interface HistogramProps {
  data: number[];
  visible: boolean;
  onToggleVisibility: () => void;
  customConfig?: Partial<PlotOptions>;
  title?: string;
  subtitle?: string;
}

export const Histogram: React.FC<HistogramProps> = ({
  data,
  visible,
  onToggleVisibility,
  customConfig,
  title,
  subtitle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxSizes, setBoxSizes] = useState<number[]>([]);
  
  useEffect(() => {
    if (!visible) return;
    setBoxSizes(data);
  }, [visible, data]);
  
  useEffect(() => {
    if (!containerRef.current || !visible || boxSizes.length === 0) return;

    containerRef.current.innerHTML = '';
    
    const chart = plot({
      ...BASE_CHART_CONFIG,
      ...(customConfig || {}),
      y: { label: "Count" },
      x: { label: "Box Area" },
      marks: [
        rectY(
          boxSizes,
          binX({ y: "count", tip: () => true })
        ),
        ruleY([0])
      ]
    });
    
    containerRef.current.appendChild(chart);
    
    return () => { chart.remove() };
  }, [boxSizes, visible, customConfig]);
  
  if (!visible) return null;
  
  return (
    <div className="histogram">
      <div className="histogram__header">
        {
          title && subtitle && (
            <div className="histogram__title-container">
              <h2 className="histogram__title">{title}</h2>
              <h6 className="histogram__subtitle">{subtitle}</h6>
            </div>
          )
        }
        <button 
          onClick={onToggleVisibility} 
          className="histogram__close-button"
          aria-label="Close histogram"
        >
          ×
        </button>
      </div>
      <div ref={containerRef} className="histogram__chart-container"></div>
    </div>
  );
};
